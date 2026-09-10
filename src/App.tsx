import React, { useState, useEffect } from 'react';
import { 
  SchoolConfig, 
  Student, 
  StaffMember, 
  UserStats, 
  PaymentRecord, 
  StudentStatus, 
  NavigationTab,
  PenaltyRecord
} from './types';
import { initialConfig, initialStudents, initialStaff, initialUserStats } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
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

export default function App() {
  // Theme state: default to 'dark' for instant eye relief ("l'application est trop blanche ça fait mal aux yeux")
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('adlon_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'dark';
  });

  // State management with safe localStorage fallback
  const [config, setConfig] = useState<SchoolConfig>(() => {
    try {
      const saved = localStorage.getItem('adlon_config');
      return saved ? JSON.parse(saved) : initialConfig;
    } catch {
      return initialConfig;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('adlon_students');
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem('adlon_staff');
      return saved ? JSON.parse(saved) : initialStaff;
    } catch {
      return initialStaff;
    }
  });

  const [userStats, setUserStats] = useState<UserStats>(initialUserStats);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Active Modals
  const [whatsAppModalData, setWhatsAppModalData] = useState<{
    student: Student;
    defaultType?: 'relance' | 'convocation' | 'felicitations';
  } | null>(null);

  const [detailModalStudent, setDetailModalStudent] = useState<Student | null>(null);
  const [paymentModalStudent, setPaymentModalStudent] = useState<Student | null>(null);
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);
  const [penaltyModalStudent, setPenaltyModalStudent] = useState<Student | null>(null);

  // Synchronize to localStorage
  useEffect(() => {
    localStorage.setItem('adlon_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('adlon_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('adlon_staff', JSON.stringify(staff));
  }, [staff]);

  // Log action helper
  const addAuditLog = (user: string, role: string, action: string, category: any) => {
    setUserStats((prev) => ({
      ...prev,
      recentAuditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: "À l'instant",
          user,
          role,
          action,
          category,
          ip: '197.214.21.84',
          device: 'Session Web Active',
        },
        ...prev.recentAuditLogs,
      ],
    }));
  };

  // Penalty Application handler (financial or disciplinary)
  const handleApplyPenalty = (studentId: string, penalty: PenaltyRecord) => {
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

        return {
          ...s,
          penalties: updatedPenalties,
          penaltyTotalAmount: newPenaltyTotal,
          totalDue: newTotalDue,
          balanceRemaining: newBalance,
          status: newStatus,
          conductScore: newConductScore,
          disciplinePoints: newDisciplinePoints,
        };
      })
    );

    const targetStudent = students.find((s) => s.id === studentId);
    const studentName = targetStudent ? `${targetStudent.firstName} ${targetStudent.lastName}` : 'Élève';
    addAuditLog(
      penalty.recordedBy || 'Surveillant Général',
      'Vie Scolaire',
      `Attribution d'une pénalité (${penalty.type}) à ${studentName} : ${penalty.reason} ${penalty.amount ? `(+${penalty.amount.toLocaleString()} FCFA)` : ''}`,
      'Vie Scolaire'
    );
  };

  // Penalty Cancellation/Removal handler
  const handleRemovePenalty = (studentId: string, penaltyId: string, cancelReason?: string) => {
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
            cancelledBy: 'Direction des Études',
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

        return {
          ...s,
          penalties: updatedPenalties,
          penaltyTotalAmount: newPenaltyTotal,
          totalDue: newTotalDue,
          balanceRemaining: newBalance,
          status: newStatus,
          conductScore: newConductScore,
          disciplinePoints: newDisciplinePoints,
        };
      })
    );

    const targetStudent = students.find((s) => s.id === studentId);
    const studentName = targetStudent ? `${targetStudent.firstName} ${targetStudent.lastName}` : 'Élève';
    addAuditLog(
      'Direction des Études',
      'Direction',
      `Retrait de pénalité pour ${studentName} (Motif : ${cancelReason || 'Régularisation'})`,
      'Vie Scolaire'
    );
  };

  // Payment recording handler
  const handleRecordPayment = (studentId: string, payment: PaymentRecord) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const newTotalPaid = s.totalPaid + payment.amount;
        const newBalance = Math.max(0, s.totalDue - newTotalPaid);
        const newStatus: StudentStatus = newBalance <= 0 ? 'solde' : newTotalPaid > 0 ? 'partiel' : 'impaye';

        return {
          ...s,
          totalPaid: newTotalPaid,
          balanceRemaining: newBalance,
          status: newStatus,
          payments: [payment, ...s.payments],
        };
      })
    );

    // Increase available bank cash
    setConfig((prev) => ({
      ...prev,
      availableBankCash: prev.availableBankCash + payment.amount,
    }));

    // Add Audit Log
    const targetStudent = students.find((s) => s.id === studentId);
    const studentName = targetStudent ? `${targetStudent.firstName} ${targetStudent.lastName} (${targetStudent.classLevel})` : 'Élève';
    addAuditLog(
      payment.cashierName,
      'Comptable',
      `Encaissement de ${payment.amount.toLocaleString()} FCFA (${payment.method}) pour ${studentName}`,
      'Finance'
    );
  };

  // Add new student (e.g. from Prorata simulator)
  const handleAddNewStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
    addAuditLog(
      'M. Gaston Bantsimba',
      'Directeur',
      `Inscription Prorata Temporis de ${newStudent.firstName} ${newStudent.lastName} (${newStudent.classLevel}) - ${newStudent.monthsEnrolled} mois`,
      'Configuration'
    );
  };

  // Add new staff
  const handleAddNewStaff = (newStaff: StaffMember) => {
    setStaff((prev) => [...prev, newStaff]);
    addAuditLog(
      'M. Gaston Bantsimba',
      'Directeur',
      `Création du contrat de ${newStaff.name} (${newStaff.role} - ${newStaff.contractType})`,
      'Sécurité'
    );
  };

  // Update students (e.g. from GradesView)
  const handleUpdateStudents = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
    addAuditLog(
      'M. Aimé Loubaki',
      'Corps Enseignant',
      'Mise à jour des notes trimestrielles et recalcul automatique des rangs',
      'Pédagogie'
    );
  };

  // Quick WhatsApp trigger from TopBar or top unpaid list
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

  const unpaidCount = students.filter(s => s.balanceRemaining > 0).length;

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0F19] text-[#1D1D1F] dark:text-[#F8FAFC] flex antialiased transition-colors duration-200">
      {/* 1. LATERAL SIDEBAR NAVIGATION */}
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
      />

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Refined TopBar */}
        <TopBar
          activeTab={activeTab}
          availableCash={config.availableBankCash}
          monthlyPayroll={config.monthlyFixedPayroll}
          onQuickWhatsAppRelance={handleQuickWhatsAppRelance}
          onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              config={config}
              students={students}
              userStats={userStats}
              onOpenWhatsApp={(student) => setWhatsAppModalData({ student, defaultType: 'relance' })}
              onOpenStudentDetail={(student) => setDetailModalStudent(student)}
              onOpenPayment={(student) => setPaymentModalStudent(student)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'enrollment' && (
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

          {activeTab === 'finance' && (
            <FinanceView
              config={config}
              students={students}
              onOpenPayment={(student) => setPaymentModalStudent(student)}
              onOpenStudentDetail={(student) => setDetailModalStudent(student)}
              onOpenWhatsApp={(student) => setWhatsAppModalData({ student, defaultType: 'relance' })}
              onAddNewStudent={handleAddNewStudent}
            />
          )}

          {activeTab === 'crm' && (
            <CrmWhatsAppView
              config={config}
              students={students}
              onOpenWhatsApp={(student, type = 'relance') =>
                setWhatsAppModalData({ student, defaultType: type })
              }
            />
          )}

          {activeTab === 'pedagogy' && (
            <PedagogyRadarView
              config={config}
              students={students}
              onOpenStudentDetail={(student) => setDetailModalStudent(student)}
              onOpenWhatsApp={(student) => setWhatsAppModalData({ student, defaultType: 'convocation' })}
            />
          )}

          {activeTab === 'grades' && (
            <GradesView
              config={config}
              students={students}
              onUpdateStudents={handleUpdateStudents}
              onOpenWhatsApp={(student, type = 'felicitations') =>
                setWhatsAppModalData({ student, defaultType: type })
              }
            />
          )}

          {activeTab === 'staff' && (
            <StaffPayrollView
              config={config}
              staff={staff}
              onAddNewStaff={handleAddNewStaff}
            />
          )}

          {activeTab === 'config' && (
            <ConfigView
              config={config}
              onSaveConfig={(updated) => {
                setConfig(updated);
                addAuditLog(
                  'M. Gaston Bantsimba',
                  'Directeur',
                  'Mise à jour de la grille tarifaire et des paramètres',
                  'Configuration'
                );
              }}
            />
          )}
        </main>

        {/* Minimalist Apple-style Footer */}
        <footer className="no-print border-t border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] py-4 px-6 text-xs text-[#64748B] dark:text-[#94A3B8]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              <strong className="text-[#1D1D1F] dark:text-[#F8FAFC] font-semibold">{config.schoolName || 'ERP ADLON'}</strong> • {config.schoolCity || 'Brazzaville'} • Année {config.academicYear || '2026-2027'}
            </span>
            <div className="flex items-center gap-4 text-[#64748B] dark:text-[#94A3B8]">
              <span>Devise : {config.currency || 'FCFA'}</span>
              <span>•</span>
              <span>Indicatif : {config.countryCode || '+242'} ({config.schoolCountry || 'Congo'})</span>
              <span>•</span>
              <span className="text-[#34C759] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]"></span>
                Système opérationnel (99.9%)
              </span>
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
            addAuditLog('Agent CRM', 'Direction', msg, 'CRM WhatsApp')
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
