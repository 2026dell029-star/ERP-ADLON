import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SchoolConfig, Student, StaffMember, AuditLog } from '../types';

const SETTINGS_DOC = 'settings/schoolConfig';
const STUDENTS_COLLECTION = 'students';
const STAFF_COLLECTION = 'staff';
const AUDIT_LOGS_COLLECTION = 'auditLogs';

// ==================== CONFIGURATION ====================
export function subscribeToSchoolConfig(
  onData: (config: SchoolConfig) => void,
  onError?: (err: unknown) => void
) {
  const configDocRef = doc(db, 'settings', 'schoolConfig');
  return onSnapshot(
    configDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as SchoolConfig);
      }
    },
    (error) => {
      console.warn('Erreur lecture Firestore SchoolConfig:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, SETTINGS_DOC);
    }
  );
}

export async function saveSchoolConfigToFirestore(config: SchoolConfig): Promise<void> {
  const configDocRef = doc(db, 'settings', 'schoolConfig');
  try {
    // Sanitize any undefined values
    const cleanConfig = JSON.parse(JSON.stringify(config));
    await setDoc(configDocRef, cleanConfig, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, SETTINGS_DOC);
  }
}

// ==================== ÉLÈVES (STUDENTS) ====================
export function subscribeToStudents(
  onData: (students: Student[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, STUDENTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Student[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as Student);
      });
      if (list.length > 0) {
        onData(list);
      }
    },
    (error) => {
      console.warn('Erreur lecture Firestore Students:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, STUDENTS_COLLECTION);
    }
  );
}

export async function saveStudentToFirestore(student: Student): Promise<void> {
  const studentRef = doc(db, STUDENTS_COLLECTION, student.id);
  try {
    const cleanStudent = JSON.parse(JSON.stringify(student));
    await setDoc(studentRef, cleanStudent, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STUDENTS_COLLECTION}/${student.id}`);
  }
}

export async function deleteStudentFromFirestore(id: string): Promise<void> {
  const studentRef = doc(db, STUDENTS_COLLECTION, id);
  try {
    await deleteDoc(studentRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${STUDENTS_COLLECTION}/${id}`);
  }
}

// ==================== PERSONNEL (STAFF) ====================
export function subscribeToStaff(
  onData: (staff: StaffMember[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, STAFF_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: StaffMember[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as StaffMember);
      });
      if (list.length > 0) {
        onData(list);
      }
    },
    (error) => {
      console.warn('Erreur lecture Firestore Staff:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, STAFF_COLLECTION);
    }
  );
}

export async function saveStaffToFirestore(member: StaffMember): Promise<void> {
  const staffRef = doc(db, STAFF_COLLECTION, member.id);
  try {
    const cleanMember = JSON.parse(JSON.stringify(member));
    await setDoc(staffRef, cleanMember, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STAFF_COLLECTION}/${member.id}`);
  }
}

export async function deleteStaffFromFirestore(id: string): Promise<void> {
  const staffRef = doc(db, STAFF_COLLECTION, id);
  try {
    await deleteDoc(staffRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${STAFF_COLLECTION}/${id}`);
  }
}

// ==================== JOURNAUX D'AUDIT (AUDIT LOGS) ====================
export function subscribeToAuditLogs(
  onData: (logs: AuditLog[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, AUDIT_LOGS_COLLECTION);
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const logs: AuditLog[] = [];
      snapshot.forEach((d) => {
        logs.push({ ...d.data(), id: d.id } as AuditLog);
      });
      if (logs.length > 0) {
        onData(logs);
      }
    },
    (error) => {
      console.warn('Erreur lecture Firestore AuditLogs:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, AUDIT_LOGS_COLLECTION);
    }
  );
}

export async function addAuditLogToFirestore(log: AuditLog): Promise<void> {
  const logRef = doc(db, AUDIT_LOGS_COLLECTION, log.id);
  try {
    const cleanLog = JSON.parse(JSON.stringify(log));
    await setDoc(logRef, cleanLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${AUDIT_LOGS_COLLECTION}/${log.id}`);
  }
}

// ==================== INITIAL SEEDING ====================
export async function seedInitialFirestoreData(
  defaultConfig: SchoolConfig,
  defaultStudents: Student[],
  defaultStaff: StaffMember[]
): Promise<boolean> {
  try {
    // 1. Check if config exists
    const configSnap = await getDoc(doc(db, 'settings', 'schoolConfig'));
    let seeded = false;

    if (!configSnap.exists()) {
      await setDoc(doc(db, 'settings', 'schoolConfig'), JSON.parse(JSON.stringify(defaultConfig)));
      seeded = true;
    }

    // 2. Check if students exist
    const studentsSnap = await getDocs(query(collection(db, STUDENTS_COLLECTION), limit(1)));
    if (studentsSnap.empty && defaultStudents.length > 0) {
      const batch = writeBatch(db);
      defaultStudents.forEach((student) => {
        const ref = doc(db, STUDENTS_COLLECTION, student.id);
        batch.set(ref, JSON.parse(JSON.stringify(student)));
      });
      await batch.commit();
      seeded = true;
    }

    // 3. Check if staff exists
    const staffSnap = await getDocs(query(collection(db, STAFF_COLLECTION), limit(1)));
    if (staffSnap.empty && defaultStaff.length > 0) {
      const batch = writeBatch(db);
      defaultStaff.forEach((member) => {
        const ref = doc(db, STAFF_COLLECTION, member.id);
        batch.set(ref, JSON.parse(JSON.stringify(member)));
      });
      await batch.commit();
      seeded = true;
    }

    return seeded;
  } catch (error) {
    console.warn('Initial seeding note (les règles de sécurité requièrent une authentification active):', error);
    return false;
  }
}
