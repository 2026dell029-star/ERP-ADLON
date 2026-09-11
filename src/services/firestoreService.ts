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
import { SchoolConfig, Student, StaffMember, AuditLog, School } from '../types';

const SCHOOLS_COLLECTION = 'schools';
const SETTINGS_DOC = 'settings/schoolConfig';
const STUDENTS_COLLECTION = 'students';
const STAFF_COLLECTION = 'staff';
const AUDIT_LOGS_COLLECTION = 'auditLogs';

// ==================== ÉTABLISSEMENTS (SCHOOLS) ====================
export function subscribeToSchools(
  onData: (schools: School[]) => void,
  onError?: (err: unknown) => void
) {
  const colRef = collection(db, SCHOOLS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: School[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as School);
      });
      onData(list);
    },
    (error) => {
      console.warn('Erreur lecture Firestore Schools:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, SCHOOLS_COLLECTION);
    }
  );
}

export async function saveSchoolToFirestore(school: School): Promise<void> {
  const schoolRef = doc(db, SCHOOLS_COLLECTION, school.id);
  try {
    const cleanSchool = JSON.parse(JSON.stringify(school));
    await setDoc(schoolRef, cleanSchool, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SCHOOLS_COLLECTION}/${school.id}`);
  }
}

// ==================== CONFIGURATION ====================
export function subscribeToSchoolConfig(
  onData: (config: SchoolConfig) => void,
  onError?: (err: unknown) => void,
  schoolId?: string
) {
  const configDocRef = schoolId 
    ? doc(db, SCHOOLS_COLLECTION, schoolId, 'settings', 'config')
    : doc(db, 'settings', 'schoolConfig');

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

export async function saveSchoolConfigToFirestore(config: SchoolConfig, schoolId?: string): Promise<void> {
  const configDocRef = schoolId
    ? doc(db, SCHOOLS_COLLECTION, schoolId, 'settings', 'config')
    : doc(db, 'settings', 'schoolConfig');

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
  onError?: (err: unknown) => void,
  schoolId?: string
) {
  const colRef = schoolId
    ? collection(db, SCHOOLS_COLLECTION, schoolId, 'students')
    : collection(db, STUDENTS_COLLECTION);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Student[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as Student);
      });
      onData(list);
    },
    (error) => {
      console.warn('Erreur lecture Firestore Students:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, STUDENTS_COLLECTION);
    }
  );
}

export async function saveStudentToFirestore(student: Student, schoolId?: string): Promise<void> {
  const studentRef = schoolId
    ? doc(db, SCHOOLS_COLLECTION, schoolId, 'students', student.id)
    : doc(db, STUDENTS_COLLECTION, student.id);

  try {
    const cleanStudent = JSON.parse(JSON.stringify(student));
    await setDoc(studentRef, cleanStudent, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STUDENTS_COLLECTION}/${student.id}`);
  }
}

export async function deleteStudentFromFirestore(id: string, schoolId?: string): Promise<void> {
  const studentRef = schoolId
    ? doc(db, SCHOOLS_COLLECTION, schoolId, 'students', id)
    : doc(db, STUDENTS_COLLECTION, id);

  try {
    await deleteDoc(studentRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${STUDENTS_COLLECTION}/${id}`);
  }
}

// ==================== PERSONNEL (STAFF) ====================
export function subscribeToStaff(
  onData: (staff: StaffMember[]) => void,
  onError?: (err: unknown) => void,
  schoolId?: string
) {
  const colRef = schoolId
    ? collection(db, SCHOOLS_COLLECTION, schoolId, 'staff')
    : collection(db, STAFF_COLLECTION);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: StaffMember[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as StaffMember);
      });
      onData(list);
    },
    (error) => {
      console.warn('Erreur lecture Firestore Staff:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, STAFF_COLLECTION);
    }
  );
}

export async function saveStaffToFirestore(member: StaffMember, schoolId?: string): Promise<void> {
  const staffRef = schoolId
    ? doc(db, SCHOOLS_COLLECTION, schoolId, 'staff', member.id)
    : doc(db, STAFF_COLLECTION, member.id);

  try {
    const cleanMember = JSON.parse(JSON.stringify(member));
    await setDoc(staffRef, cleanMember, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STAFF_COLLECTION}/${member.id}`);
  }
}

export async function deleteStaffFromFirestore(id: string, schoolId?: string): Promise<void> {
  const staffRef = schoolId
    ? doc(db, SCHOOLS_COLLECTION, schoolId, 'staff', id)
    : doc(db, STAFF_COLLECTION, id);

  try {
    await deleteDoc(staffRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${STAFF_COLLECTION}/${id}`);
  }
}

// ==================== JOURNAUX D'AUDIT (AUDIT LOGS) ====================
export function subscribeToAuditLogs(
  onData: (logs: AuditLog[]) => void,
  onError?: (err: unknown) => void,
  schoolId?: string
) {
  const colRef = schoolId
    ? collection(db, SCHOOLS_COLLECTION, schoolId, 'auditLogs')
    : collection(db, AUDIT_LOGS_COLLECTION);

  const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const logs: AuditLog[] = [];
      snapshot.forEach((d) => {
        logs.push({ ...d.data(), id: d.id } as AuditLog);
      });
      onData(logs);
    },
    (error) => {
      console.warn('Erreur lecture Firestore AuditLogs:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, AUDIT_LOGS_COLLECTION);
    }
  );
}

export async function addAuditLogToFirestore(log: AuditLog, schoolId?: string): Promise<void> {
  const logRef = schoolId
    ? doc(db, SCHOOLS_COLLECTION, schoolId, 'auditLogs', log.id)
    : doc(db, AUDIT_LOGS_COLLECTION, log.id);

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
  _defaultStudents: Student[],
  _defaultStaff: StaffMember[],
  schoolId?: string
): Promise<boolean> {
  try {
    const configPath = schoolId ? `schools/${schoolId}/settings/schoolConfig` : 'settings/schoolConfig';

    // Check if config exists, only initialize clean config if missing
    const configSnap = await getDoc(doc(db, configPath));
    let seeded = false;

    if (!configSnap.exists()) {
      await setDoc(doc(db, configPath), JSON.parse(JSON.stringify(defaultConfig)));
      seeded = true;
    }

    // Never seed mock students or staff - schools must be completely clean
    return seeded;
  } catch (error) {
    console.warn('Initial seeding note (les règles de sécurité requièrent une authentification active):', error);
    return false;
  }
}
