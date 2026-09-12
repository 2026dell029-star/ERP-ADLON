export type StudentStatus = 'solde' | 'partiel' | 'impaye';
export type StudentCycle = 'Préscolaire' | 'Primaire' | 'Collège' | 'Lycée';
export type ContractType = 'CDI' | 'CDD';
export type PaymentMethod = 'Espèces' | 'Airtel Money' | 'MTN Mobile Money' | 'Virement';
export type StaffRole = 'Directeur' | 'Comptable' | 'Enseignant' | 'Surveillant Général' | 'Secrétaire';
export type PenaltyType = 'financiere' | 'disciplinaire' | 'retard';

export interface PenaltyRecord {
  id: string;
  date: string;
  type: PenaltyType;
  amount: number; // Montant en FCFA (si pénalité financière ou majoration de retard)
  pointsDeducted: number; // Points de conduite retirés (si sanction disciplinaire)
  reason: string; // Motif de la pénalité (ex: Retard de paiement, Dégradation de matériel, Absences répétées)
  recordedBy: string; // Responsable ayant émis la pénalité (ex: Surveillant Général, Comptabilité, Direction)
  status: 'active' | 'annulee';
  cancelledAt?: string;
  cancelReason?: string;
  cancelledBy?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  receiptNumber: string;
  cashierName: string;
  note?: string;
}

export interface Student {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  cycle: StudentCycle;
  classLevel: string; // e.g. CE2, 6ème, 3ème, Tle S
  isNewStudent: boolean;
  hasCanteen: boolean;
  enrollmentDate: string;
  monthsEnrolled: number; // e.g. 10 or 8 if joined in Nov
  annualTuitionFull: number; // e.g. 180 000
  effectiveTuition: number; // after prorata temporis
  registrationFee: number; // 25 000 (new) or 15 000 (old)
  canteenTotal: number; // 20 000 * monthsEnrolled if enrolled
  totalDue: number;
  totalPaid: number;
  balanceRemaining: number;
  status: StudentStatus;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  parentMeetingAttended: number;
  parentMeetingTotal: number;
  parentMeetingAbsences: number; // trigger alert if >= 2
  // Pedagogy & Conduct
  gpa: number; // /20
  classRank: number;
  totalStudentsInClass: number;
  conductScore: number; // /20
  disciplinePoints: number; // points deducted or recorded
  unexcusedAbsences: number;
  tardinessCount: number;
  academicRemarks: string;
  payments: PaymentRecord[];
  // Penalties & Sanctions
  penalties?: PenaltyRecord[];
  penaltyTotalAmount?: number; // Total des pénalités financières actives
  // Registration dossier details
  gender?: 'M' | 'F';
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
  documentsProvided?: {
    birthCertificate: boolean;
    lastReportCard: boolean;
    photoId: boolean;
    medicalCertificate: boolean;
  };
  registrationFeePaid?: boolean;
  // Academic grades by term
  termGrades?: Record<string, SubjectGrade[]>;
}

export interface SubjectGrade {
  subjectId: string;
  subjectName: string;
  coefficient: number;
  score: number; // Moyenne de la matière /20
  homeworkScore?: number; // Note de devoir /20
  compositionScore?: number; // Note de composition /20
  teacherName?: string;
  teacherRemark?: string;
  classAverage?: number;
}

export interface StudentTermReport {
  studentId: string;
  term: string; // 'Trimestre 1' | 'Trimestre 2' | 'Trimestre 3'
  grades: SubjectGrade[];
  totalPoints: number;
  totalCoefficients: number;
  generalAverage: number;
  classRank: number;
  totalStudents: number;
  classAverage: number;
  highestAverage: number;
  lowestAverage: number;
  conductScore: number;
  unexcusedAbsences: number;
  tardinessCount: number;
  councilMention: string;
  academicRemarks: string;
}

export type WeekDay = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';

export interface TimetableSlot {
  id: string;
  day: WeekDay;
  startTime: string; // e.g. "08:00" or "08h00"
  endTime: string;   // e.g. "10:00" or "10h00"
  className: string; // e.g. "6ème", "3ème", "Terminale D"
  subjectName: string; // e.g. "Histoire-Géographie"
  teacherId: string;   // StaffMember.id
  teacherName: string; // StaffMember.name
  roomNumber?: string;
  note?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  contractType: ContractType;
  monthlySalary: number;
  assignedGradeOrSubject: string;
  phone: string;
  hireDate: string;
  status: 'Actif' | 'En congé';
  assignedClasses?: string[];
  assignedSubjects?: string[];
  assignedCycles?: StudentCycle[];
  payType?: 'fixed' | 'hourly'; // 'fixed' (mensuel fixe) ou 'hourly' (prestataire / vacataire au taux horaire)
  hourlyRate?: number; // Taux horaire en FCFA/heure (ex: 2 500)
  weeklyHours?: number; // Heures hebdomadaires cumulées dans l'emploi du temps
}

export interface CyclePricing {
  cycle: StudentCycle;
  minTuition: number;
  maxTuition: number;
  defaultTuition: number;
}

export interface ClassDefinition {
  id: string;
  name: string; // e.g. "CE2", "3ème A", "Terminale D"
  cycle: StudentCycle; // 'Préscolaire' | 'Primaire' | 'Collège' | 'Lycée'
  mainTeacher?: string; // Enseignant titulaire
  roomNumber?: string;
  maxCapacity?: number;
  description?: string;
  monthlyTuition?: number; // Montant mensuel à payer en FCFA pour 1 mois (ex: 18 000 FCFA / mois)
  registrationFee?: number; // Frais d'inscription pour nouveaux élèves (FCFA)
  reRegistrationFee?: number; // Frais de réinscription pour anciens élèves (FCFA)
}

export interface SubjectDefinition {
  id: string;
  classLevel: string; // matches ClassDefinition.name e.g. "CE2" (or specific class)
  name: string; // e.g. "Mathématiques", "Sciences Physiques"
  coefficient: number; // Coefficient déterminé par l'utilisateur
  category?: 'Scientifique' | 'Littéraire' | 'Sport & Arts' | 'Vie Scolaire' | 'Autre';
  defaultTeacher?: string;
}

export interface SchoolConfig {
  schoolName?: string; // Nom officiel de l'établissement
  schoolLogo?: string; // Logo de l'école (URL ou base64)
  schoolMotto?: string; // Devise officielle de l'école
  schoolAddress?: string; // Adresse physique
  schoolCity?: string; // Ville
  schoolCountry?: string; // Pays
  schoolDepartment?: string; // Direction Départementale ou Académie
  schoolPhone?: string; // Téléphone standard
  schoolEmail?: string; // Email officiel
  directorName?: string; // Nom du Chef d'Établissement / Directeur
  ministerialApproval?: string; // N° d'Agrément ministériel
  academicYear: string;
  countryCode: string; // +242 for Congo
  currency: string; // FCFA
  schoolDurationMonths: number; // 10
  registrationFeeNew: number; // 0 FCFA par défaut
  registrationFeeOld: number; // 0 FCFA par défaut
  canteenMonthlyFee: number; // 0 FCFA par défaut
  parentAbsenceAlertThreshold: number; // 2
  availableBankCash: number; // Solde réel disponible en banque (0 FCFA par défaut)
  monthlyFixedPayroll: number; // Masse salariale mensuelle fixe ou calculée (0 FCFA par défaut)
  pricingByCycle: CyclePricing[];
  classes?: ClassDefinition[];
  classSubjects?: Record<string, SubjectDefinition[]>; // mapping classLevel -> SubjectDefinition[]
  timetableSlots?: TimetableSlot[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  category: 'Finance' | 'Pédagogie' | 'CRM WhatsApp' | 'Vie Scolaire' | 'Sécurité' | 'Configuration';
  ip: string;
  device: string;
}

export interface UserStats {
  activeUsersNow: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionMinutes: number;
  systemAvailability: number; // 99.9%
  roleBreakdown: {
    role: string;
    totalAccounts: number;
    activeToday: number;
    avgDailyTimeMin: number;
    color: string;
  }[];
  hourlyActivity: {
    hour: string;
    trafficPct: number;
    isPeak?: boolean;
    label?: string;
  }[];
  moduleAdoption: {
    module: string;
    adoptionRate: number; // %
    totalActionsWeek: number;
    trend: string;
  }[];
  recentAuditLogs: AuditLog[];
}

export type NavigationTab = 'dashboard' | 'enrollment' | 'finance' | 'crm' | 'pedagogy' | 'grades' | 'staff' | 'config';

export type UserRole = 'dirigeant' | 'gestionnaire' | 'directeur';

export interface School {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  currency: string;
  academicYear: string;
  logo?: string;
  logoUrl?: string;
  directorName?: string;
  motto?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  createdBy?: string;
  adminEmails?: string[];
  studentCount?: number;
  config?: SchoolConfig;
}

export interface RolePermissionConfig {
  id: UserRole;
  title: string;
  badge: string;
  shortDesc: string;
  fullDesc: string;
  allowedTabs: NavigationTab[];
  canManageFinances: boolean;
  canManageEnrollment: boolean;
  canEditGrades: boolean;
  canManageStaff: boolean;
  canEditConfig: boolean;
  color: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissionConfig> = {
  dirigeant: {
    id: 'dirigeant',
    title: 'Dirigeant',
    badge: 'Accès Intégral',
    shortDesc: 'Supervision globale, finances, inscriptions, bulletins et configuration.',
    fullDesc: 'Accès illimité à l\'ensemble des modules de l\'ERP.',
    allowedTabs: ['dashboard', 'enrollment', 'finance', 'crm', 'pedagogy', 'grades', 'staff', 'config'],
    canManageFinances: true,
    canManageEnrollment: true,
    canEditGrades: true,
    canManageStaff: true,
    canEditConfig: true,
    color: 'from-amber-500 to-orange-600',
  },
  gestionnaire: {
    id: 'gestionnaire',
    title: 'Gestionnaire',
    badge: 'Finances & Inscriptions',
    shortDesc: 'Limité à la partie financière et aux inscriptions.',
    fullDesc: 'Inscriptions des élèves, calcul de scolarité, encaissements et suivi financier.',
    allowedTabs: ['dashboard', 'enrollment', 'finance'],
    canManageFinances: true,
    canManageEnrollment: true,
    canEditGrades: false,
    canManageStaff: false,
    canEditConfig: false,
    color: 'from-blue-600 to-indigo-600',
  },
  directeur: {
    id: 'directeur',
    title: 'Directeur',
    badge: 'Pédagogie, Paie & CRM',
    shortDesc: 'Notes, bulletins, radar pédagogique, personnel & paie et CRM WhatsApp.',
    fullDesc: 'Direction pédagogique, gestion du personnel & paie, saisie des notes, bulletins officiels et communication CRM WhatsApp.',
    allowedTabs: ['dashboard', 'pedagogy', 'grades', 'crm', 'staff'],
    canManageFinances: false,
    canManageEnrollment: false,
    canEditGrades: true,
    canManageStaff: true,
    canEditConfig: false,
    color: 'from-emerald-600 to-teal-600',
  },
};
