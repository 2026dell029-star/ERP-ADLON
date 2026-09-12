import React, { useState, useEffect } from 'react';
import { 
  SchoolConfig, 
  Student, 
  StaffMember, 
  UserStats, 
  PaymentRecord, 
  StudentStatus, 
  NavigationTab,
  PenaltyRecord,
  School,
  UserRole,
  ROLE_PERMISSIONS,
  CashTransaction
} from './types';
import { initialConfig, initialStudents, initialStaff, initialUserStats } from './data/mockData';
import { syncStudentsRanksAndCounts } from './utils/gradeCalculations';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { AuthView } from './components/AuthView';
import { SchoolSelectionView } from './components/SchoolSelectionView';
import { RoleSelectionView } from './components/RoleSelectionView';
import { DashboardView } from './components/DashboardView';
import { FinanceView } from './components/FinanceView';
import { CrmWhatsAppView } from './components/CrmWhatsAppView';
import { PedagogyRadarView } from './components/PedagogyRadarView';
import { GradesView } from './components/GradesView';
import { StaffPayrollView } from './components/StaffPayrollView';
import { ConfigView } from './components/ConfigView';
import { EnrollmentView } from './components/EnrollmentView';
import { WhatsAppPreviewModal } from './components/WhatsAppPreviewModal';
import { PaymentModal } from './components/PaymentModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { ReportCardModal } from './components/ReportCardModal';
import { PenaltyModal } from './components/PenaltyModal';
import { useAuth } from './context/AuthContext';
import {
  subscribeToSchools,
  saveSchoolToFirestore,
  subscribeToSchoolConfig,
  subscribeToStudents,
  subscribeToStaff,
  subscribeToAuditLogs,
  saveSchoolConfigToFirestore,
  saveStudentToFirestore,
  saveStaffToFirestore,
  deleteStaffFromFirestore,
  addAuditLogToFirestore,
  seedInitialFirestoreData,
} from './services/firestoreService';
import { Flame, Building2, ShieldCheck, GraduationCap, Wallet } from 'lucide-react';

const isMockStudent = (s: any) =>
  !s ||
  s.id === 'std-1' ||
  s.id === 'std-2' ||
  s.id === 'std-3' ||
  s.id === 'std-4' ||
  s.id === 'std-5' ||
  s.firstName === 'Dieuveil' ||
  s.firstName === 'Merdi' ||
  s.firstName === 'Princilia' ||
  s.firstName === 'Grâce' ||
  s.firstName === 'Divine';

const isMockStaff = (st: any) =>
  !st ||
  st.id === 'stf-1' ||
  st.id === 'stf-2' ||
  st.id === 'stf-3' ||
  st.id === 'stf-4' ||
  st.name === 'M. Aimé Loubaki' ||
  st.name === 'M. Serge Ngoma' ||
  st.name === 'Mme Brigitte Bouesso' ||
  st.name === 'M. Paul Mavoungou';

const DEFAULT_INITIAL_SCHOOLS: School[] = [
  {
    id: 'school_default',
    name: 'Mon Établissement Scolaire',
    code: 'ECOLE-01',
    city: 'Brazzaville',
    country: 'Congo',
    currency: 'FCFA',
    academicYear: '2026-2027',
    directorName: '',
    motto: '',
    createdAt: new Date().toISOString(),
    studentCount: 0,
  }
];

export default function App() {
  const { user, loading } = useAuth();

  // Theme state: default to 'dark' for instant eye relief
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('adlon_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'dark';
  });

  // Schools list state
  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const saved = localStorage.getItem('adlon_schools');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return DEFAULT_INITIAL_SCHOOLS;
    } catch {
      return DEFAULT_INITIAL_SCHOOLS;
    }
  });

  // Currently selected School (An account is linked to only 1 single school)
  const [currentSchool, setCurrentSchool] = useState<School | null>(() => {
    try {
      const saved = localStorage.getItem('adlon_current_school');
      if (saved) return JSON.parse(saved);
      const savedSchools = localStorage.getItem('adlon_schools');
      if (savedSchools) {
        const parsed = JSON.parse(savedSchools);
        if (parsed && parsed.length > 0) return parsed[0];
      }
      return DEFAULT_INITIAL_SCHOOLS[0];
    } catch {
      return DEFAULT_INITIAL_SCHOOLS[0];
    }
  });

  // Currently selected User Role: 'dirigeant' | 'gestionnaire' | 'directeur' | null
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    try {
      const saved = localStorage.getItem('adlon_current_role');
      return (saved === 'dirigeant' || saved === 'gestionnaire' || saved === 'directeur') ? saved : null;
    } catch {
      return null;
    }
  });

  // State management for active school data - clean initialization without mock data or non-zero default amounts
  const [config, setConfig] = useState<SchoolConfig>(() => {
    try {
      const saved = localStorage.getItem('adlon_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.registrationFeeNew === 25000) parsed.registrationFeeNew = 0;
        if (parsed.registrationFeeOld === 15000) parsed.registrationFeeOld = 0;
        if (parsed.canteenMonthlyFee === 20000) parsed.canteenMonthlyFee = 0;
        // Purge residual mock simulation amounts: bank cash of 470 000 / 420 000 and fixed payroll of 730 000
        if (parsed.availableBankCash === 470000 || parsed.availableBankCash === 420000) parsed.availableBankCash = 0;
        if (parsed.monthlyFixedPayroll === 730000) parsed.monthlyFixedPayroll = 0;
        if (parsed.classes && Array.isArray(parsed.classes)) {
          parsed.classes = parsed.classes.map((c: any) => ({
            ...c,
            monthlyTuition: (c.monthlyTuition === 15500 || c.monthlyTuition === 16000 || c.monthlyTuition === 17500 || c.monthlyTuition === 18000 || c.monthlyTuition === 19000 || c.monthlyTuition === 20000 || c.monthlyTuition === 22000 || c.monthlyTuition === 22500 || c.monthlyTuition === 23000 || c.monthlyTuition === 24000 || c.monthlyTuition === 26000 || c.monthlyTuition === 27000 || c.monthlyTuition === 28000) ? 0 : (c.monthlyTuition || 0)
          }));
        }
        if (parsed.pricingByCycle && Array.isArray(parsed.pricingByCycle)) {
          parsed.pricingByCycle = parsed.pricingByCycle.map((p: any) => ({
            ...p,
            minTuition: 0,
            maxTuition: 0,
            defaultTuition: 0
          }));
        }
        return { ...initialConfig, ...parsed };
      }
      return initialConfig;
    } catch {
      return initialConfig;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const savedSchool = localStorage.getItem('adlon_current_school');
      const schoolId = savedSchool ? JSON.parse(savedSchool)?.id : null;
      const key = schoolId ? `adlon_students_${schoolId}` : 'adlon_students';
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((s: Student) => !isMockStudent(s));
          return syncStudentsRanksAndCounts(clean);
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const savedSchool = localStorage.getItem('adlon_current_school');
      const schoolId = savedSchool ? JSON.parse(savedSchool)?.id : null;
      const key = schoolId ? `adlon_staff_${schoolId}` : 'adlon_staff';
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((st: StaffMember) => !isMockStaff(st));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() => {
    try {
      const savedSchool = localStorage.getItem('adlon_current_school');
      const schoolId = savedSchool ? JSON.parse(savedSchool)?.id : null;
      const key = schoolId ? `adlon_cash_transactions_${schoolId}` : 'adlon_cash_transactions';
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const key = currentSchool ? `adlon_cash_transactions_${currentSchool.id}` : 'adlon_cash_transactions';
      localStorage.setItem('adlon_cash_transactions', JSON.stringify(cashTransactions));
      if (currentSchool) {
        localStorage.setItem(key, JSON.stringify(cashTransactions));
      }
    } catch (e) {
      console.error('Failed to save cash transactions', e);
    }
  }, [cashTransactions, currentSchool]);

  const handleAddCashTransaction = (tx: CashTransaction) => {
    setCashTransactions((prev) => [tx, ...prev]);
  };

  const handleDeleteCashTransaction = (id: string) => {
    setCashTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const [userStats, setUserStats] = useState<UserStats>(initialUserStats);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active Modals
  const [whatsAppModalData, setWhatsAppModalData] = useState<{
    student: Student;
    defaultType?: 'relance' | 'convocation' | 'felicitations';
  } | null>(null);

  const [detailModalStudent, setDetailModalStudent] = useState<Student | null>(null);
  const [paymentModalStudent, setPaymentModalStudent] = useState<Student | null>(null);
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);
  const [penaltyModalStudent, setPenaltyModalStudent] = useState<Student | null>(null);

  // Sync theme to document element and localStorage
  useEffect(() => {
    localStorage.setItem('adlon_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync persistence
  useEffect(() => {
    localStorage.setItem('adlon_schools', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    if (currentSchool) {
      localStorage.setItem('adlon_current_school', JSON.stringify(currentSchool));
    } else {
      localStorage.removeItem('adlon_current_school');
    }
  }, [currentSchool]);

  useEffect(() => {
    if (currentRole) {
      localStorage.setItem('adlon_current_role', currentRole);
    } else {
      localStorage.removeItem('adlon_current_role');
    }
  }, [currentRole]);

  // Auto-clean any residual legacy mock amounts (470 000 / 420 000 cash or 730 000 payroll)
  useEffect(() => {
    if (config.availableBankCash === 470000 || config.availableBankCash === 420000 || config.monthlyFixedPayroll === 730000) {
      setConfig((prev) => ({
        ...prev,
        availableBankCash: (prev.availableBankCash === 470000 || prev.availableBankCash === 420000) ? 0 : prev.availableBankCash,
        monthlyFixedPayroll: prev.monthlyFixedPayroll === 730000 ? 0 : prev.monthlyFixedPayroll,
      }));
    }
  }, [config.availableBankCash, config.monthlyFixedPayroll]);

  useEffect(() => {
    localStorage.setItem('adlon_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    const cleanStudents = students.filter((s) => !isMockStudent(s));
    localStorage.setItem('adlon_students', JSON.stringify(cleanStudents));
    if (currentSchool) {
      localStorage.setItem(`adlon_students_${currentSchool.id}`, JSON.stringify(cleanStudents));
      setSchools((prev) =>
        prev.map((s) => (s.id === currentSchool.id ? { ...s, studentCount: cleanStudents.length } : s))
      );
    }
  }, [students, currentSchool]);

  useEffect(() => {
    const cleanStaff = staff.filter((st) => !isMockStaff(st));
    localStorage.setItem('adlon_staff', JSON.stringify(cleanStaff));
    if (currentSchool) {
      localStorage.setItem(`adlon_staff_${currentSchool.id}`, JSON.stringify(cleanStaff));
    }
  }, [staff, currentSchool]);

  // Sync active school data changes to config
  useEffect(() => {
    if (currentSchool) {
      setConfig((prev) => ({
        ...prev,
        schoolName: currentSchool.name,
        schoolCity: currentSchool.city,
        currency: currentSchool.currency,
        academicYear: currentSchool.academicYear,
      }));
    }
  }, [currentSchool]);

  // Ensure active tab is allowed for current role
  useEffect(() => {
    if (currentRole) {
      const allowed = ROLE_PERMISSIONS[currentRole]?.allowedTabs || ['dashboard'];
      if (!allowed.includes(activeTab)) {
        setActiveTab(allowed[0] || 'dashboard');
      }
    }
  }, [currentRole, activeTab]);

  // Subscribe to schools list from Firestore if authenticated
  useEffect(() => {
    if (loading || !user) return;

    const unsubSchools = subscribeToSchools((remoteSchools) => {
      if (remoteSchools && remoteSchools.length > 0) {
        setSchools(remoteSchools);
      }
    });

    return () => {
      unsubSchools();
    };
  }, [user, loading]);

  // Subscribe to active school's Firestore collections
  useEffect(() => {
    if (loading || !user || !currentSchool) return;

    const schoolId = currentSchool.id;

    // Baseline initial config for this school if needed (clean, no students or staff)
    seedInitialFirestoreData(config, [], [], schoolId).catch(console.warn);

    const unsubConfig = subscribeToSchoolConfig(
      (remoteConfig) => {
        if (remoteConfig && remoteConfig.schoolName) {
          const cleanRemote = { ...remoteConfig };
          if (cleanRemote.availableBankCash === 470000 || cleanRemote.availableBankCash === 420000) {
            cleanRemote.availableBankCash = 0;
          }
          if (cleanRemote.monthlyFixedPayroll === 730000) {
            cleanRemote.monthlyFixedPayroll = 0;
          }
          setConfig((prev) => ({ ...prev, ...cleanRemote }));
        }
      },
      undefined,
      schoolId
    );

    const unsubStudents = subscribeToStudents(
      (remoteStudents) => {
        const clean = (remoteStudents || []).filter((s) => !isMockStudent(s));
        setStudents(syncStudentsRanksAndCounts(clean));
      },
      undefined,
      schoolId
    );

    const unsubStaff = subscribeToStaff(
      (remoteStaff) => {
        const clean = (remoteStaff || []).filter((st) => !isMockStaff(st));
        setStaff(clean);
      },
      undefined,
      schoolId
    );

    const unsubLogs = subscribeToAuditLogs(
      (remoteLogs) => {
        setUserStats((prev) => ({ ...prev, recentAuditLogs: remoteLogs || [] }));
      },
      undefined,
      schoolId
    );

    return () => {
      unsubConfig();
      unsubStudents();
      unsubStaff();
      unsubLogs();
    };
  }, [user, loading, currentSchool]);

  // Handle School Selection
  const handleSelectSchool = (school: School) => {
    setCurrentSchool(school);
    setCurrentRole(null);
    try {
      const schoolKey = `adlon_students_${school.id}`;
      const savedStudents = localStorage.getItem(schoolKey);
      if (savedStudents) {
        const parsed = JSON.parse(savedStudents);
        const clean = Array.isArray(parsed) ? parsed.filter((s: Student) => !isMockStudent(s)) : [];
        setStudents(syncStudentsRanksAndCounts(clean));
      } else {
        setStudents([]);
      }

      const staffKey = `adlon_staff_${school.id}`;
      const savedStaff = localStorage.getItem(staffKey);
      if (savedStaff) {
        const parsed = JSON.parse(savedStaff);
        const clean = Array.isArray(parsed) ? parsed.filter((st: StaffMember) => !isMockStaff(st)) : [];
        setStaff(clean);
      } else {
        setStaff([]);
      }
    } catch {
      setStudents([]);
      setStaff([]);
    }
  };

  // Handle School Creation
  const handleCreateSchool = (newSchool: School) => {
    const cleanSchool = { ...newSchool, studentCount: 0 };
    setSchools((prev) => [cleanSchool, ...prev]);
    if (user) {
      saveSchoolToFirestore(cleanSchool).catch(console.warn);
    }
    setCurrentSchool(cleanSchool);
    setCurrentRole(null);
    setStudents([]);
    setStaff([]);
    try {
      localStorage.setItem(`adlon_students_${cleanSchool.id}`, JSON.stringify([]));
      localStorage.setItem(`adlon_staff_${cleanSchool.id}`, JSON.stringify([]));
      localStorage.setItem('adlon_students', JSON.stringify([]));
      localStorage.setItem('adlon_staff', JSON.stringify([]));
    } catch (e) {
      console.warn(e);
    }
  };

  // Handle Role Selection
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    const allowed = ROLE_PERMISSIONS[role].allowedTabs;
    setActiveTab(allowed[0] || 'dashboard');
  };

  // Log action helper
  const addAuditLog = (author: string, role: string, action: string, category: any) => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: "À l'instant",
      user: author,
      role,
      action,
      category,
      ip: '197.214.21.84',
      device: 'Session Web Active',
    };

    setUserStats((prev) => ({
      ...prev,
      recentAuditLogs: [newLog, ...prev.recentAuditLogs],
    }));

    if (user) {
      addAuditLogToFirestore(newLog, currentSchool?.id).catch((e) => console.warn('Audit log write error:', e));
    }
  };

  // Penalty Application handler
  const handleApplyPenalty = (studentId: string, penalty: PenaltyRecord) => {
    let updatedStudentObj: Student | null = null;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const currentPenalties = s.penalties || [];
        const updatedPenalties = [penalty, ...currentPenalties];
        
        const financialDelta = penalty.amount || 0;
        const newPenaltyTotal = (s.penaltyTotalAmount || 0) + financialDelta;
        const newTotalDue = s.totalDue + financialDelta;
        const newBalance = Math.max(0, newTotalDue - s.totalPaid);
        const newStatus: StudentStatus = newBalance <= 0 ? 'solde' : s.totalPaid > 0 ? 'partiel' : 'impaye';

        const pointsDeducted = penalty.pointsDeducted || 0;
        const newConductScore = Math.max(0, s.conductScore - pointsDeducted);
        const newDisciplinePoints = s.disciplinePoints + pointsDeducted;

        const updated: Student = {
          ...s,
          penalties: updatedPenalties,
          penaltyTotalAmount: newPenaltyTotal,
          totalDue: newTotalDue,
          balanceRemaining: newBalance,
          status: newStatus,
          conductScore: newConductScore,
          disciplinePoints: newDisciplinePoints,
        };

        updatedStudentObj = updated;
        return updated;
      })
    );

    if (updatedStudentObj && user) {
      saveStudentToFirestore(updatedStudentObj, currentSchool?.id).catch(console.warn);
    }

    const targetStudent = students.find((s) => s.id === studentId);
    const studentName = targetStudent ? `${targetStudent.firstName} ${targetStudent.lastName}` : 'Élève';
    addAuditLog(
      penalty.recordedBy || user?.displayName || 'Surveillant Général',
      'Vie Scolaire',
      `Attribution d'une pénalité (${penalty.type}) à ${studentName} : ${penalty.reason} ${penalty.amount ? `(+${penalty.amount.toLocaleString()} FCFA)` : ''}`,
      'Vie Scolaire'
    );
  };

  // Penalty Cancellation/Removal handler
  const handleRemovePenalty = (studentId: string, penaltyId: string, cancelReason?: string) => {
    let updatedStudentObj: Student | null = null;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const targetPenalty = (s.penalties || []).find((p) => p.id === penaltyId);
        if (!targetPenalty || targetPenalty.status === 'annulee') return s;

        const updatedPenalties = (s.penalties || []).map((p) => {
          if (p.id !== penaltyId) return p;
          return {
            ...p,
            status: 'annulee' as const,
            cancelledAt: new Date().toLocaleDateString('fr-FR'),
            cancelReason: cancelReason || 'Régularisation effectuée',
            cancelledBy: user?.displayName || 'Direction des Études',
          };
        });

        const financialDelta = targetPenalty.amount || 0;
        const newPenaltyTotal = Math.max(0, (s.penaltyTotalAmount || 0) - financialDelta);
        const newTotalDue = Math.max(0, s.totalDue - financialDelta);
        const newBalance = Math.max(0, newTotalDue - s.totalPaid);
        const newStatus: StudentStatus = newBalance <= 0 ? 'solde' : s.totalPaid > 0 ? 'partiel' : 'impaye';

        const pointsRestored = targetPenalty.pointsDeducted || 0;
        const newConductScore = Math.min(20, s.conductScore + pointsRestored);
        const newDisciplinePoints = Math.max(0, s.disciplinePoints - pointsRestored);

        const updated: Student = {
          ...s,
          penalties: updatedPenalties,
          penaltyTotalAmount: newPenaltyTotal,
          totalDue: newTotalDue,
          balanceRemaining: newBalance,
          status: newStatus,
          conductScore: newConductScore,
          disciplinePoints: newDisciplinePoints,
        };

        updatedStudentObj = updated;
        return updated;
      })
    );

    if (updatedStudentObj && user) {
      saveStudentToFirestore(updatedStudentObj, currentSchool?.id).catch(console.warn);
    }

    const targetStudent = students.find((s) => s.id === studentId);
    const studentName = targetStudent ? `${targetStudent.firstName} ${targetStudent.lastName}` : 'Élève';
    addAuditLog(
      user?.displayName || 'Direction des Études',
      'Direction',
      `Retrait de pénalité pour ${studentName} (Motif : ${cancelReason || 'Régularisation'})`,
      'Vie Scolaire'
    );
  };

  // Payment recording handler
  const handleRecordPayment = (studentId: string, payment: PaymentRecord) => {
    let updatedStudentObj: Student | null = null;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const newTotalPaid = s.totalPaid + payment.amount;
        const newBalance = Math.max(0, s.totalDue - newTotalPaid);
        const newStatus: StudentStatus = newBalance <= 0 ? 'solde' : newTotalPaid > 0 ? 'partiel' : 'impaye';

        const updated: Student = {
          ...s,
          totalPaid: newTotalPaid,
          balanceRemaining: newBalance,
          status: newStatus,
          payments: [payment, ...s.payments],
        };

        updatedStudentObj = updated;
        return updated;
      })
    );

    if (updatedStudentObj && user) {
      saveStudentToFirestore(updatedStudentObj, currentSchool?.id).catch(console.warn);
    }

    // Increase available bank cash
    const updatedConfig: SchoolConfig = {
      ...config,
      availableBankCash: config.availableBankCash + payment.amount,
    };
    setConfig(updatedConfig);
    if (user) {
      saveSchoolConfigToFirestore(updatedConfig, currentSchool?.id).catch(console.warn);
    }

    const targetStudent = students.find((s) => s.id === studentId);
    const studentName = targetStudent ? `${targetStudent.firstName} ${targetStudent.lastName}` : 'Élève';
    addAuditLog(
      payment.cashierName || user?.displayName || 'Comptable',
      'Comptable',
      `Encaissement de ${payment.amount.toLocaleString()} FCFA (${payment.method}) pour ${studentName}`,
      'Finance'
    );
  };

  // Add new student
  const handleAddNewStudent = (newStudent: Student) => {
    setStudents((prev) => syncStudentsRanksAndCounts([newStudent, ...prev], 'Trimestre 1', config));
    if (user) {
      saveStudentToFirestore(newStudent, currentSchool?.id).catch(console.warn);
    }

    addAuditLog(
      user?.displayName || 'Direction',
      'Admissions',
      `Inscription de ${newStudent.firstName} ${newStudent.lastName} (${newStudent.classLevel}) - ${newStudent.monthsEnrolled} mois`,
      'Configuration'
    );
  };

  // Add new staff
  const handleAddNewStaff = (newStaff: StaffMember) => {
    setStaff((prev) => [...prev, newStaff]);
    if (user) {
      saveStaffToFirestore(newStaff, currentSchool?.id).catch(console.warn);
    }

    addAuditLog(
      user?.displayName || 'Direction',
      'Direction',
      `Création du contrat de ${newStaff.name} (${newStaff.role} - ${newStaff.contractType})`,
      'Sécurité'
    );
  };

  // Update staff member
  const handleUpdateStaff = (updatedMember: StaffMember) => {
    setStaff((prev) => prev.map((s) => (s.id === updatedMember.id ? updatedMember : s)));
    if (user) {
      saveStaffToFirestore(updatedMember, currentSchool?.id).catch(console.warn);
    }

    addAuditLog(
      user?.displayName || 'Direction',
      'Direction',
      `Mise à jour des affectations et contrat de ${updatedMember.name}`,
      'Configuration'
    );
  };

  // Delete staff member
  const handleDeleteStaff = (staffId: string) => {
    const target = staff.find((s) => s.id === staffId);
    setStaff((prev) => prev.filter((s) => s.id !== staffId));
    if (user) {
      deleteStaffFromFirestore(staffId, currentSchool?.id).catch(console.warn);
    }

    if (target) {
      addAuditLog(
        user?.displayName || 'Direction',
        'Direction',
        `Suppression du contrat de ${target.name}`,
        'Sécurité'
      );
    }
  };

  // Update students
  const handleUpdateStudents = (updatedStudents: Student[]) => {
    const synced = syncStudentsRanksAndCounts(updatedStudents, 'Trimestre 1', config);
    setStudents(synced);
    if (user) {
      synced.forEach((st) => {
        saveStudentToFirestore(st, currentSchool?.id).catch(console.warn);
      });
    }

    addAuditLog(
      user?.displayName || 'Directeur des Études',
      'Corps Enseignant',
      'Mise à jour des notes trimestrielles et recalcul automatique des rangs',
      'Pédagogie'
    );
  };

  // Quick WhatsApp trigger
  const handleQuickWhatsAppRelance = () => {
    const topUnpaid = [...students]
      .filter((s) => s.balanceRemaining > 0)
      .sort((a, b) => b.balanceRemaining - a.balanceRemaining);

    if (topUnpaid.length > 0) {
      setWhatsAppModalData({ student: topUnpaid[0], defaultType: 'relance' });
    } else {
      setActiveTab('crm');
    }
  };

  // ==================== SCREEN 0: LOADING SPINNER ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase">
            Initialisation de l'environnement ERP ADLON...
          </p>
        </div>
      </div>
    );
  }

  // ==================== SCREEN 1: LOGIN GATE (MANDATORY BEFORE ANY CONTENT) ====================
  if (!user) {
    return <AuthView theme={theme} onToggleTheme={toggleTheme} />;
  }

  // ==================== SCREEN 2: SCHOOL SELECTION / CREATION ====================
  if (!currentSchool) {
    return (
      <SchoolSelectionView
        schools={schools}
        onSelectSchool={handleSelectSchool}
        onCreateSchool={handleCreateSchool}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // ==================== SCREEN 3: ROLE SELECTION (DIRIGEANT / GESTIONNAIRE / DIRECTEUR) ====================
  if (!currentRole) {
    return (
      <RoleSelectionView
        currentSchool={currentSchool}
        onSelectRole={handleSelectRole}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // ==================== SCREEN 4: MAIN WORKSPACE DASHBOARD ====================
  const roleConfig = ROLE_PERMISSIONS[currentRole];

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0F19] text-[#1D1D1F] dark:text-[#F8FAFC] flex antialiased transition-colors duration-200">
      {/* 1. LATERAL SIDEBAR NAVIGATION (Filtered by Role) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        activeUsersCount={userStats.activeUsersNow}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        config={config}
        currentSchool={currentSchool}
        activeRole={currentRole}
        onChangeRole={() => setCurrentRole(null)}
      />

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* TopBar with Role and School controls */}
        <TopBar
          activeTab={activeTab}
          availableCash={config.availableBankCash}
          monthlyPayroll={config.monthlyFixedPayroll > 0 ? config.monthlyFixedPayroll : staff.reduce((acc, s) => acc + (s.monthlySalary || 0), 0)}
          onQuickWhatsAppRelance={handleQuickWhatsAppRelance}
          onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
          activeRole={currentRole}
          currentSchool={currentSchool}
          onChangeRole={() => setCurrentRole(null)}
        />

        {/* Dynamic View Canvas according to authorized activeTab */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && roleConfig.allowedTabs.includes('dashboard') && (
            <DashboardView
              config={config}
              students={students}
              staff={staff}
              userStats={userStats}
              onOpenWhatsApp={(student) => setWhatsAppModalData({ student, defaultType: 'relance' })}
              onOpenStudentDetail={(student) => setDetailModalStudent(student)}
              onOpenPayment={(student) => setPaymentModalStudent(student)}
              onNavigateTab={(tab) => {
                if (roleConfig.allowedTabs.includes(tab)) {
                  setActiveTab(tab);
                }
              }}
              onUpdateConfig={(updatedConfig) => {
                setConfig(updatedConfig);
                if (user) {
                  saveSchoolConfigToFirestore(updatedConfig, currentSchool?.id).catch(console.warn);
                }
              }}
            />
          )}

          {activeTab === 'enrollment' && roleConfig.allowedTabs.includes('enrollment') && (
            <EnrollmentView
              config={config}
              students={students}
              onAddNewStudent={handleAddNewStudent}
              onOpenPayment={(student) => setPaymentModalStudent(student)}
              onOpenStudentDetail={(student) => setDetailModalStudent(student)}
              onOpenWhatsApp={(student, type = 'relance') =>
                setWhatsAppModalData({ student, defaultType: type })
              }
              onOpenPenalty={(student) => setPenaltyModalStudent(student)}
            />
          )}

          {activeTab === 'finance' && roleConfig.allowedTabs.includes('finance') && (
            <FinanceView
              config={config}
              students={students}
              staff={staff}
              cashTransactions={cashTransactions}
              onAddCashTransaction={handleAddCashTransaction}
              onDeleteCashTransaction={handleDeleteCashTransaction}
              onOpenPayment={(student) => setPaymentModalStudent(student)}
              onOpenStudentDetail={(student) => setDetailModalStudent(student)}
              onOpenWhatsApp={(student) => setWhatsAppModalData({ student, defaultType: 'relance' })}
              onAddNewStudent={handleAddNewStudent}
            />
          )}

          {activeTab === 'crm' && roleConfig.allowedTabs.includes('crm') && (
            <CrmWhatsAppView
              config={config}
              students={students}
              onOpenWhatsApp={(student, type = 'relance') =>
                setWhatsAppModalData({ student, defaultType: type })
              }
            />
          )}

          {activeTab === 'pedagogy' && roleConfig.allowedTabs.includes('pedagogy') && (
            <PedagogyRadarView
              config={config}
              students={students}
              onOpenStudentDetail={(student) => setDetailModalStudent(student)}
              onOpenWhatsApp={(student) => setWhatsAppModalData({ student, defaultType: 'convocation' })}
            />
          )}

          {activeTab === 'grades' && roleConfig.allowedTabs.includes('grades') && (
            <GradesView
              config={config}
              students={students}
              onUpdateStudents={handleUpdateStudents}
              onOpenWhatsApp={(student, type = 'felicitations') =>
                setWhatsAppModalData({ student, defaultType: type })
              }
            />
          )}

          {activeTab === 'staff' && roleConfig.allowedTabs.includes('staff') && (
            <StaffPayrollView
              config={config}
              staff={staff}
              onAddNewStaff={handleAddNewStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
              onUpdateConfig={(updatedConfig) => {
                setConfig(updatedConfig);
                if (user) {
                  saveSchoolConfigToFirestore(updatedConfig, currentSchool?.id).catch(console.warn);
                }
              }}
            />
          )}

          {activeTab === 'config' && roleConfig.allowedTabs.includes('config') && (
            <ConfigView
              config={config}
              onSaveConfig={(updated) => {
                setConfig(updated);
                if (currentSchool) {
                  const updatedSchool: School = {
                    ...currentSchool,
                    name: updated.schoolName || currentSchool.name,
                    city: updated.schoolCity || currentSchool.city,
                    logo: updated.schoolLogo || currentSchool.logo,
                    logoUrl: updated.schoolLogo || currentSchool.logoUrl,
                    academicYear: updated.academicYear || currentSchool.academicYear,
                    motto: updated.schoolMotto || currentSchool.motto,
                    phone: updated.schoolPhone || currentSchool.phone,
                    address: updated.schoolAddress || currentSchool.address,
                  };
                  setCurrentSchool(updatedSchool);
                  localStorage.setItem(`selected_school_${user?.uid || 'default'}`, JSON.stringify(updatedSchool));
                }
                if (user) {
                  saveSchoolConfigToFirestore(updated, currentSchool?.id).catch(console.warn);
                }
                addAuditLog(
                  user?.displayName || 'Dirigeant',
                  'Direction',
                  `Mise à jour des paramètres & identité de l'établissement (${updated.schoolName || 'École'})`,
                  'Configuration'
                );
              }}
            />
          )}
        </main>

        {/* Minimalist Footer */}
        <footer className="no-print border-t border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] py-4 px-6 text-xs text-[#64748B] dark:text-[#94A3B8]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              <strong className="text-[#1D1D1F] dark:text-[#F8FAFC] font-semibold">{currentSchool.name}</strong> • {currentSchool.city} • Année {currentSchool.academicYear}
            </span>
            <div className="flex items-center gap-4 text-[#64748B] dark:text-[#94A3B8]">
              <span>Rôle actif : <strong className="text-blue-500 font-semibold">{roleConfig.title}</strong></span>
              <span>•</span>
              <span>Devise : {currentSchool.currency}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* 3. MODALS */}
      {whatsAppModalData && (
        <WhatsAppPreviewModal
          student={whatsAppModalData.student}
          countryCode={config.countryCode}
          defaultType={whatsAppModalData.defaultType}
          config={config}
          onClose={() => setWhatsAppModalData(null)}
          onLoggedAction={(msg) =>
            addAuditLog(user?.displayName || 'Agent CRM', 'Direction', msg, 'CRM WhatsApp')
          }
        />
      )}

      {paymentModalStudent && (
        <PaymentModal
          student={paymentModalStudent}
          config={config}
          onClose={() => setPaymentModalStudent(null)}
          onRecordPayment={handleRecordPayment}
        />
      )}

      {detailModalStudent && (
        <StudentDetailModal
          student={students.find(s => s.id === detailModalStudent.id) || detailModalStudent}
          countryCode={config.countryCode}
          onClose={() => setDetailModalStudent(null)}
          onOpenWhatsApp={(s) => {
            setDetailModalStudent(null);
            setWhatsAppModalData({ student: s, defaultType: 'relance' });
          }}
          onOpenPayment={(s) => {
            setDetailModalStudent(null);
            setPaymentModalStudent(s);
          }}
          onOpenBulletin={(s) => {
            setDetailModalStudent(null);
            setReportCardStudent(s);
          }}
          onOpenPenalty={(s) => {
            setDetailModalStudent(null);
            setPenaltyModalStudent(s);
          }}
        />
      )}

      {penaltyModalStudent && (
        <PenaltyModal
          student={students.find(s => s.id === penaltyModalStudent.id) || penaltyModalStudent}
          onClose={() => setPenaltyModalStudent(null)}
          onApplyPenalty={handleApplyPenalty}
          onRemovePenalty={handleRemovePenalty}
        />
      )}

      {reportCardStudent && (
        <ReportCardModal
          student={reportCardStudent}
          allStudents={students}
          config={config}
          onClose={() => setReportCardStudent(null)}
          onSelectStudent={(st) => setReportCardStudent(st)}
        />
      )}
    </div>
  );
}
