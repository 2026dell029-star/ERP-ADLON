import React, { useState, useMemo } from 'react';
import { SchoolConfig, Student, StudentCycle, StudentStatus } from '../types';
import { formatFCFA, cleanPhoneNumber, getClassMonthlyTuition, getClassRegistrationFee, getClassesForCycle } from '../utils/formatters';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Utensils, 
  Phone, 
  MessageCircle, 
  FileText, 
  CreditCard, 
  Eye, 
  X, 
  Sparkles,
  Calendar,
  Building,
  GraduationCap,
  ShieldCheck,
  Check,
  ShieldAlert
} from 'lucide-react';

interface EnrollmentViewProps {
  config: SchoolConfig;
  students: Student[];
  onAddNewStudent: (newStudent: Student) => void;
  onOpenPayment: (student: Student) => void;
  onOpenStudentDetail: (student: Student) => void;
  onOpenWhatsApp: (student: Student, type?: 'relance' | 'convocation' | 'felicitations') => void;
  onOpenPenalty?: (student: Student) => void;
}

const CLASS_LEVELS_BY_CYCLE: Record<StudentCycle, string[]> = {
  'Préscolaire': ['Petite Section (PS)', 'Moyenne Section (MS)', 'Grande Section (GS)'],
  'Primaire': ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'],
  'Collège': ['6ème', '5ème', '4ème', '3ème'],
  'Lycée': ['2nde A', '2nde C', '1ère A', '1ère D', 'Tle A', 'Tle D', 'Tle C', 'Tle S'],
};

const MONTHS_LIST = [
  { name: 'Septembre', index: 1, monthsLeft: 10 },
  { name: 'Octobre', index: 2, monthsLeft: 9 },
  { name: 'Novembre', index: 3, monthsLeft: 8 },
  { name: 'Décembre', index: 4, monthsLeft: 7 },
  { name: 'Janvier', index: 5, monthsLeft: 6 },
  { name: 'Février', index: 6, monthsLeft: 5 },
  { name: 'Mars', index: 7, monthsLeft: 4 },
  { name: 'Avril', index: 8, monthsLeft: 3 },
  { name: 'Mai', index: 9, monthsLeft: 2 },
  { name: 'Juin', index: 10, monthsLeft: 1 },
];

export const EnrollmentView: React.FC<EnrollmentViewProps> = ({
  config,
  students,
  onAddNewStudent,
  onOpenPayment,
  onOpenStudentDetail,
  onOpenWhatsApp,
  onOpenPenalty,
}) => {
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all'); // all | new | old
  const [selectedCanteen, setSelectedCanteen] = useState<string>('all');
  const [selectedPenaltyFilter, setSelectedPenaltyFilter] = useState<string>('all'); // all | with-penalty | no-penalty

  // Available classes for active cycle filter
  const availableClassesForCycle = useMemo(() => {
    return getClassesForCycle(selectedCycle, config);
  }, [selectedCycle, config]);

  // Modal states
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [attestationStudent, setAttestationStudent] = useState<Student | null>(null);

  // New Student Registration Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'M' as 'M' | 'F',
    birthDate: '',
    address: '',
    cycle: 'Primaire' as StudentCycle,
    classLevel: 'CP1',
    isNewStudent: true,
    hasCanteen: false,
    enrollmentMonth: 1, // Septembre (10 mois)
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    initialPaymentAmount: 0,
    paymentMethod: 'Espèces' as 'Espèces' | 'Airtel Money' | 'MTN Mobile Money' | 'Virement',
    cashierName: '',
    notes: '',
    docs: {
      birthCertificate: false,
      lastReportCard: false,
      photoId: false,
      medicalCertificate: false,
    },
  });

  // Calculate tuition preview based on class monthly rate and arrival month
  const selectedClassObj = config.classes?.find(c => c.name === formData.classLevel);
  const monthlyTuition = selectedClassObj?.monthlyTuition || getClassMonthlyTuition(formData.classLevel, config, formData.cycle);
  const fullTuition = monthlyTuition * config.schoolDurationMonths;
  const monthData = MONTHS_LIST.find(m => m.index === formData.enrollmentMonth) || MONTHS_LIST[0];
  const monthsEnrolled = monthData.monthsLeft;
  const prorataTuition = monthlyTuition * monthsEnrolled;
  const registrationFee = getClassRegistrationFee(formData.classLevel, formData.isNewStudent, config);
  const canteenTotal = formData.hasCanteen ? config.canteenMonthlyFee * monthsEnrolled : 0;
  const grandTotalDue = prorataTuition + registrationFee + canteenTotal;

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentPhone.includes(searchTerm);

      const matchesCycle = selectedCycle === 'all' || student.cycle === selectedCycle;
      const matchesClass = selectedClass === 'all' || student.classLevel.toLowerCase() === selectedClass.toLowerCase();
      const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
      const matchesType = 
        selectedType === 'all' || 
        (selectedType === 'new' && student.isNewStudent) || 
        (selectedType === 'old' && !student.isNewStudent);
      const matchesCanteen = 
        selectedCanteen === 'all' || 
        (selectedCanteen === 'yes' && student.hasCanteen) || 
        (selectedCanteen === 'no' && !student.hasCanteen);

      const hasActivePenalties = (student.penalties || []).some(p => p.status === 'active');
      const matchesPenalty = 
        selectedPenaltyFilter === 'all' || 
        (selectedPenaltyFilter === 'with-penalty' && hasActivePenalties) || 
        (selectedPenaltyFilter === 'no-penalty' && !hasActivePenalties);

      return matchesSearch && matchesCycle && matchesClass && matchesStatus && matchesType && matchesCanteen && matchesPenalty;
    });
  }, [students, searchTerm, selectedCycle, selectedClass, selectedStatus, selectedType, selectedCanteen, selectedPenaltyFilter]);

  // Statistics
  const totalEnrolled = students.length;
  const newStudentsCount = students.filter(s => s.isNewStudent).length;
  const returningStudentsCount = totalEnrolled - newStudentsCount;
  const canteenCount = students.filter(s => s.hasCanteen).length;
  const penalizedStudentsCount = students.filter(s => (s.penalties || []).some(p => p.status === 'active')).length;
  const totalRegistrationFeesCollected = students.reduce((sum, s) => {
    // If student paid at least registration fee
    return sum + (s.totalPaid >= s.registrationFee ? s.registrationFee : s.totalPaid);
  }, 0);

  // Form submit handler
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.parentPhone.trim()) {
      alert('Veuillez remplir au minimum le nom, prénom et le téléphone du parent.');
      return;
    }

    const nextIdNumber = students.length + 1;
    const matricule = `ADL-2026-${String(nextIdNumber).padStart(4, '0')}`;
    const initialPaid = Math.max(0, Number(formData.initialPaymentAmount) || 0);
    const balance = Math.max(0, grandTotalDue - initialPaid);
    const status: StudentStatus = balance === 0 ? 'solde' : initialPaid > 0 ? 'partiel' : 'impaye';

    const payments = initialPaid > 0 ? [{
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: initialPaid,
      method: formData.paymentMethod,
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      cashierName: formData.cashierName,
      note: `Versement initial inscription - ${matricule}`,
    }] : [];

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      matricule,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      cycle: formData.cycle,
      classLevel: formData.classLevel,
      isNewStudent: formData.isNewStudent,
      hasCanteen: formData.hasCanteen,
      enrollmentDate: new Date().toISOString().split('T')[0],
      monthsEnrolled,
      annualTuitionFull: fullTuition,
      effectiveTuition: prorataTuition,
      registrationFee,
      canteenTotal,
      totalDue: grandTotalDue,
      totalPaid: initialPaid,
      balanceRemaining: balance,
      status,
      parentName: formData.parentName.trim() || 'Parent / Tuteur',
      parentPhone: cleanPhoneNumber(formData.parentPhone),
      parentEmail: formData.parentEmail.trim() || undefined,
      parentMeetingAttended: 0,
      parentMeetingTotal: 0,
      parentMeetingAbsences: 0,
      gpa: 12.0,
      classRank: 0,
      totalStudentsInClass: 25,
      conductScore: 18,
      disciplinePoints: 0,
      unexcusedAbsences: 0,
      tardinessCount: 0,
      academicRemarks: 'Nouvelle admission pour l\'année 2026-2027.',
      payments,
      gender: formData.gender,
      birthDate: formData.birthDate,
      address: formData.address,
      documentsProvided: formData.docs,
      registrationFeePaid: initialPaid >= registrationFee,
    };

    onAddNewStudent(newStudent);
    setIsRegisterModalOpen(false);
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'M',
      birthDate: '',
      address: '',
      cycle: 'Primaire',
      classLevel: 'CP1',
      isNewStudent: true,
      hasCanteen: false,
      enrollmentMonth: 1,
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      initialPaymentAmount: 0,
      paymentMethod: 'Espèces',
      cashierName: '',
      notes: '',
      docs: {
        birthCertificate: false,
        lastReportCard: false,
        photoId: false,
        medicalCertificate: false,
      },
    });
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Matricule', 'Nom', 'Prénom', 'Cycle', 'Classe', 'Statut Inscription', 'Cantine', 'Total Dû (FCFA)', 'Total Payé (FCFA)', 'Solde Restant (FCFA)', 'Statut Financier', 'Parent', 'Téléphone Congo'];
    const rows = filteredStudents.map(s => [
      s.matricule,
      s.lastName,
      s.firstName,
      s.cycle,
      s.classLevel,
      s.isNewStudent ? 'Nouveau' : 'Ancien / Réinscrit',
      s.hasCanteen ? 'Oui' : 'Non',
      s.totalDue,
      s.totalPaid,
      s.balanceRemaining,
      s.status,
      s.parentName,
      `+242 ${s.parentPhone}`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ADLON_Registre_Inscriptions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS BAR (Soft UI with Circular Pastel Icon Pills) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] p-4.5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Total Inscrits</span>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0071E3] dark:bg-blue-900/30 dark:text-[#38BDF8] flex items-center justify-center shadow-2xs shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
            {totalEnrolled}
          </div>
          <div className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Effectif rentrée 2026-2027
          </div>
        </div>

        <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] p-4.5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Nouveaux Élèves</span>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center shadow-2xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {newStudentsCount}
          </div>
          <div className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Réf. : {formatFCFA(config.registrationFeeNew)} (défini par classe)
          </div>
        </div>

        <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] p-4.5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Réinscriptions</span>
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center shadow-2xs shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
            {returningStudentsCount}
          </div>
          <div className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Réf. : {formatFCFA(config.registrationFeeOld)} (défini par classe)
          </div>
        </div>

        <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] p-4.5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Demi-Pension</span>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center shadow-2xs shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
            {canteenCount}
          </div>
          <div className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Inscrits à la cantine scolaire
          </div>
        </div>

        <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] p-4.5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Frais Encaissés</span>
            <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 flex items-center justify-center shadow-2xs shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-[#0071E3] dark:text-[#38BDF8]">
            {formatFCFA(totalRegistrationFeesCollected)}
          </div>
          <div className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Droit d'admission perçu
          </div>
        </div>
      </div>

      {/* 2. ACTION CONTROLS & SEARCH */}
      <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Rechercher par nom, matricule, parent ou n°..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748B] hover:text-[#1D1D1F] dark:hover:text-[#F8FAFC]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#26334D] bg-white dark:bg-[#0F172A] hover:bg-[#F4F5F7] dark:hover:bg-[#1E293B] text-xs font-medium text-[#1D1D1F] dark:text-[#F8FAFC] transition-colors"
              title="Exporter la liste au format CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
              <span className="hidden sm:inline">Exporter CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#26334D] bg-white dark:bg-[#0F172A] hover:bg-[#F4F5F7] dark:hover:bg-[#1E293B] text-xs font-medium text-[#1D1D1F] dark:text-[#F8FAFC] transition-colors no-print"
              title="Imprimer le registre"
            >
              <Printer className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-all shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Nouvelle Inscription</span>
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#222F46] text-xs">
          <div className="flex items-center gap-1.5 text-[#64748B] dark:text-[#94A3B8] font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres :</span>
          </div>

          {/* Cycle filter */}
          <select
            value={selectedCycle}
            onChange={(e) => {
              setSelectedCycle(e.target.value);
              setSelectedClass('all');
            }}
            className="px-2.5 py-1 rounded-lg bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] text-xs focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
          >
            <option value="all">Tous les cycles</option>
            <option value="Préscolaire">Préscolaire</option>
            <option value="Primaire">Primaire</option>
            <option value="Collège">Collège</option>
            <option value="Lycée">Lycée</option>
          </select>

          {/* Linked Class filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
          >
            <option value="all">
              {selectedCycle === 'all' ? 'Toutes les classes' : `Toutes les classes (${selectedCycle})`}
            </option>
            {availableClassesForCycle.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] text-xs focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
          >
            <option value="all">Tous types d'inscription</option>
            <option value="new">Nouveaux élèves ({newStudentsCount})</option>
            <option value="old">Réinscriptions ({returningStudentsCount})</option>
          </select>

          {/* Financial Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] text-xs focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
          >
            <option value="all">Tous statuts financiers</option>
            <option value="solde">Soldé (100%)</option>
            <option value="partiel">Paiement Partiel</option>
            <option value="impaye">Impayé / En attente</option>
          </select>

          {/* Canteen filter */}
          <select
            value={selectedCanteen}
            onChange={(e) => setSelectedCanteen(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] text-xs focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
          >
            <option value="all">Cantine (Tous)</option>
            <option value="yes">Demi-pensionnaires ({canteenCount})</option>
            <option value="no">Externes</option>
          </select>

          {/* Penalties filter */}
          <select
            value={selectedPenaltyFilter}
            onChange={(e) => setSelectedPenaltyFilter(e.target.value)}
            className={`px-2.5 py-1 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-[#0071E3] ${
              selectedPenaltyFilter !== 'all'
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold'
                : 'bg-[#F4F5F7] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC]'
            }`}
          >
            <option value="all">Pénalités (Toutes)</option>
            <option value="with-penalty">Avec pénalités ({penalizedStudentsCount})</option>
            <option value="no-penalty">Sans pénalité ({students.length - penalizedStudentsCount})</option>
          </select>

          <span className="ml-auto text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Affichage de <strong>{filteredStudents.length}</strong> élève{filteredStudents.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* 3. STUDENTS REGISTRY TABLE */}
      <div className="bg-white dark:bg-[#151D2E] rounded-2xl border border-[#E2E8F0] dark:border-[#222F46] overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-[#E2E8F0] dark:border-[#222F46] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F8FAFC]">
              Registre Officiel des Inscriptions
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Année Scolaire 2026-2027 • République du Congo
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded-lg bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC]">
            Effectif : {filteredStudents.length} / {students.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F5F7] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#222F46] text-[#64748B] dark:text-[#94A3B8] font-medium">
                <th className="py-3 px-4">Élève & Matricule</th>
                <th className="py-3 px-3">Cycle & Classe</th>
                <th className="py-3 px-3">Type & Entrée</th>
                <th className="py-3 px-3">Cantine</th>
                <th className="py-3 px-3">Frais Inscription</th>
                <th className="py-3 px-3">Scolarité Totale</th>
                <th className="py-3 px-3">Solde Restant</th>
                <th className="py-3 px-3">Parent / Contact (+242)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#222F46]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F4F5F7] dark:bg-[#0F172A] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8]">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F8FAFC]">Aucun élève ne correspond aux critères</p>
                    <p className="text-xs mt-1">Modifiez vos filtres ou effectuez une nouvelle inscription.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isNew = student.isNewStudent;
                  const isSolde = student.balanceRemaining === 0;
                  const activePenaltiesList = (student.penalties || []).filter(p => p.status === 'active');
                  const activePenaltiesCount = activePenaltiesList.length;
                  const activeFinancialPenaltiesTotal = activePenaltiesList.reduce((sum, p) => sum + (p.amount || 0), 0);

                  return (
                    <tr 
                      key={student.id}
                      className="hover:bg-[#F4F5F7]/50 dark:hover:bg-[#1E293B]/50 transition-colors group"
                    >
                      {/* Élève & Matricule */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1D1D1F] dark:bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {student.firstName[0]}{student.lastName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[13px] text-[#1D1D1F] dark:text-[#F8FAFC]">
                                {student.firstName} {student.lastName}
                              </span>
                              {activePenaltiesCount > 0 && (
                                <button
                                  onClick={() => onOpenPenalty && onOpenPenalty(student)}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-300 dark:border-rose-800 hover:bg-rose-200 transition-colors"
                                  title="Cliquez pour gérer les pénalités de cet élève"
                                >
                                  <ShieldAlert className="w-2.5 h-2.5" />
                                  <span>{activePenaltiesCount} pénalité{activePenaltiesCount > 1 ? 's' : ''}</span>
                                </button>
                              )}
                            </div>
                            <div className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                              <span>{student.matricule}</span>
                              <span>•</span>
                              <span>Inscrit le {student.enrollmentDate}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cycle & Classe */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-[#1D1D1F] dark:text-[#F8FAFC]">
                          {student.classLevel}
                        </span>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {student.cycle}
                        </div>
                      </td>

                      {/* Type & Entrée */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          isNew 
                            ? 'bg-[#0071E3]/10 dark:bg-[#2563EB]/20 text-[#0071E3] dark:text-[#38BDF8]' 
                            : 'bg-[#64748B]/10 dark:bg-[#334155] text-[#1D1D1F] dark:text-[#E2E8F0]'
                        }`}>
                          {isNew ? 'Nouveau' : 'Réinscrit'}
                        </span>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                          {student.monthsEnrolled} mois ({student.monthsEnrolled === 10 ? 'Rentrée normale' : 'Prorata'})
                        </div>
                      </td>

                      {/* Cantine */}
                      <td className="py-3.5 px-3">
                        {student.hasCanteen ? (
                          <span className="inline-flex items-center gap-1 text-[#34C759] dark:text-[#34D399] font-medium text-[11px]">
                            <Utensils className="w-3 h-3" />
                            Cantine ({student.monthsEnrolled}m)
                          </span>
                        ) : (
                          <span className="text-[#64748B] dark:text-[#64748B] text-[11px]">
                            Externe
                          </span>
                        )}
                      </td>

                      {/* Frais Inscription */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-medium text-[#1D1D1F] dark:text-[#F8FAFC]">
                          {formatFCFA(student.registrationFee)}
                        </div>
                        <div className="text-[10px] text-[#34C759] dark:text-[#34D399] flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          Acquitté
                        </div>
                      </td>

                      {/* Scolarité Totale */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono text-[#1D1D1F] dark:text-[#F8FAFC]">
                          {formatFCFA(student.totalDue)}
                        </div>
                        <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                          Payé : {formatFCFA(student.totalPaid)}
                        </div>
                      </td>

                      {/* Solde Restant */}
                      <td className="py-3.5 px-3">
                        {isSolde ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#34C759] dark:text-[#34D399]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Soldé
                          </span>
                        ) : (
                          <div className="font-mono font-semibold text-[#FF3B30] dark:text-[#F87171]">
                            {formatFCFA(student.balanceRemaining)}
                          </div>
                        )}
                      </td>

                      {/* Parent & Contact */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-[#1D1D1F] dark:text-[#F8FAFC] truncate max-w-[140px]">
                          {student.parentName}
                        </div>
                        <button
                          onClick={() => onOpenWhatsApp(student, 'relance')}
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-[#0071E3] dark:text-[#38BDF8] hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          +242 {student.parentPhone}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Attestation d'inscription */}
                          <button
                            onClick={() => setAttestationStudent(student)}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#26334D] bg-white dark:bg-[#0F172A] hover:bg-[#F4F5F7] dark:hover:bg-[#1E293B] text-[#1D1D1F] dark:text-[#F8FAFC] transition-colors"
                            title="Imprimer l'Attestation d'inscription"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp Direct */}
                          <button
                            onClick={() => onOpenWhatsApp(student, 'relance')}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#26334D] bg-white dark:bg-[#0F172A] hover:bg-[#25D366]/10 text-[#25D366] transition-colors"
                            title="Envoyer message WhatsApp (+242)"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          {/* Encaisser */}
                          <button
                            onClick={() => onOpenPayment(student)}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#26334D] bg-white dark:bg-[#0F172A] hover:bg-[#0071E3]/10 text-[#0071E3] dark:text-[#38BDF8] transition-colors"
                            title="Enregistrer un versement"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>

                          {/* Fiche Élève */}
                          <button
                            onClick={() => onOpenStudentDetail(student)}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#26334D] bg-white dark:bg-[#0F172A] hover:bg-[#F4F5F7] dark:hover:bg-[#1E293B] text-[#1D1D1F] dark:text-[#F8FAFC] transition-colors"
                            title="Voir la fiche détaillée"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Pénalités (Donner / Retirer) */}
                          <button
                            onClick={() => onOpenPenalty && onOpenPenalty(student)}
                            className={`p-1.5 rounded-lg border transition-all relative ${
                              activePenaltiesCount > 0
                                ? 'border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 shadow-xs'
                                : 'border-[#E2E8F0] dark:border-[#26334D] bg-white dark:bg-[#0F172A] hover:bg-rose-50 dark:hover:bg-rose-950/20 text-[#64748B] dark:text-[#94A3B8] hover:text-rose-600 dark:hover:text-rose-400'
                            }`}
                            title={activePenaltiesCount > 0 ? `${activePenaltiesCount} pénalité(s) active(s) - Gérer / Retirer` : "Donner une pénalité (financière ou disciplinaire)"}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            {activePenaltiesCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                                {activePenaltiesCount}
                              </span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL NOUVELLE INSCRIPTION */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-[#E2E8F0] dark:border-[#222F46] max-w-2xl w-full my-4 sm:my-8 p-5 sm:p-6 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#222F46]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center shadow-md">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F8FAFC]">
                    Formulaire d'Inscription d'un Élève
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Admission officielle • Année scolaire 2026-2027
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 rounded-full text-[#64748B] hover:text-[#1D1D1F] dark:hover:text-[#F8FAFC] hover:bg-[#F4F5F7] dark:hover:bg-[#0F172A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              {/* SECTION A : IDENTITÉ DE L'ÉLÈVE */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071E3] dark:text-[#38BDF8]">
                  1. Identité de l'élève
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#1D1D1F] dark:text-[#F8FAFC] mb-1">
                      Nom de famille *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mabiala"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#1D1D1F] dark:text-[#F8FAFC] mb-1">
                      Prénom(s) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dieuveil"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#1D1D1F] dark:text-[#F8FAFC] mb-1">
                      Sexe
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    >
                      <option value="M">Masculin (Garçon)</option>
                      <option value="F">Féminin (Fille)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#1D1D1F] dark:text-[#F8FAFC] mb-1">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-[#1D1D1F] dark:text-[#F8FAFC] mb-1">
                      Adresse de résidence (Congo)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Bacongo, Brazzaville"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B : CYCLE, CLASSE ET MOIS D'ENTRÉE */}
              <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#222F46]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071E3] dark:text-[#38BDF8]">
                  2. Niveau Scolaire & Prorata Temporis
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#1D1D1F] dark:text-[#F8FAFC] mb-1">
                      Cycle d'enseignement
                    </label>
                    <select
                      value={formData.cycle}
                      onChange={(e) => {
                        const newCycle = e.target.value as StudentCycle;
                        const availableClasses = CLASS_LEVELS_BY_CYCLE[newCycle];
                        setFormData({
                          ...formData,
                          cycle: newCycle,
                          classLevel: availableClasses[0] || 'CE2',
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    >
                      <option value="Préscolaire">Préscolaire</option>
                      <option value="Primaire">Primaire</option>
                      <option value="Collège">Collège</option>
                      <option value="Lycée">Lycée</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#1D1D1F] dark:text-[#F8FAFC] mb-1">
                      Classe demandée
                    </label>
                    <select
                      value={formData.classLevel}
                      onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] font-semibold"
                    >
                      {((config.classes || []).filter(c => c.cycle === formData.cycle).length > 0
                        ? (config.classes || []).filter(c => c.cycle === formData.cycle).map(c => c.name)
                        : CLASS_LEVELS_BY_CYCLE[formData.cycle]
                      ).map(lvl => {
                        const classObj = config.classes?.find(c => c.name === lvl);
                        const mTuition = classObj?.monthlyTuition || getClassMonthlyTuition(lvl, config, formData.cycle);
                        return (
                          <option key={lvl} value={lvl}>
                            {lvl} ({formatFCFA(mTuition)}/mois)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#1D1D1F] dark:text-[#F8FAFC] mb-1">
                      Mois d'intégration
                    </label>
                    <select
                      value={formData.enrollmentMonth}
                      onChange={(e) => setFormData({ ...formData, enrollmentMonth: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    >
                      {MONTHS_LIST.map(m => (
                        <option key={m.index} value={m.index}>
                          {m.name} ({m.monthsLeft} mois restants)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Badges Nouveau et Cantine */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div 
                    onClick={() => setFormData({ ...formData, isNewStudent: !formData.isNewStudent })}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      formData.isNewStudent 
                        ? 'bg-[#0071E3]/10 dark:bg-[#2563EB]/20 border-[#0071E3] dark:border-[#2563EB]' 
                        : 'bg-[#F4F5F7] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#26334D]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[12px] text-[#1D1D1F] dark:text-[#F8FAFC]">
                        {formData.isNewStudent ? 'Nouvelle Inscription' : 'Ancien Élève / Réinscription'}
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        Frais d'inscription : {formData.isNewStudent ? '25 000 FCFA' : '15 000 FCFA'}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${formData.isNewStudent ? 'bg-[#0071E3] text-white' : 'border border-[#64748B]'}`}>
                      {formData.isNewStudent && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  <div 
                    onClick={() => setFormData({ ...formData, hasCanteen: !formData.hasCanteen })}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      formData.hasCanteen 
                        ? 'bg-[#34C759]/10 dark:bg-[#22C55E]/20 border-[#34C759] dark:border-[#22C55E]' 
                        : 'bg-[#F4F5F7] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#26334D]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[12px] text-[#1D1D1F] dark:text-[#F8FAFC]">
                        Option Cantine Scolaire
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        20 000 FCFA / mois ({formatFCFA(config.canteenMonthlyFee * monthsEnrolled)})
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${formData.hasCanteen ? 'bg-[#34C759] text-white' : 'border border-[#64748B]'}`}>
                      {formData.hasCanteen && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C : PARENT / CONTACT TUTEUR (+242) */}
              <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#222F46]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071E3] dark:text-[#38BDF8]">
                  3. Responsable Légal & Contact E.164 (+242)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#1D1D1F] dark:text-[#F8FAFC] mb-1">
                      Nom complet du Parent / Tuteur *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: M. Jean-Paul Mabiala"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#1D1D1F] dark:text-[#F8FAFC] mb-1">
                      Téléphone mobile Congo (WhatsApp) *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-2 rounded-xl bg-[#E2E8F0] dark:bg-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] font-mono font-medium text-xs">
                        +242
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 066543210 ou 055123456"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION D : CALCULATEUR INSTANTANÉ & RÈGLEMENT */}
              <div className="p-4 rounded-2xl bg-[#F4F5F7] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26334D] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Droit d'inscription :</span>
                  <span className="font-mono font-medium text-[#1D1D1F] dark:text-[#F8FAFC]">
                    {formatFCFA(registrationFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">
                    Scolarité {formData.classLevel} ({formatFCFA(monthlyTuition)}/mois × {monthsEnrolled} mois) :
                  </span>
                  <span className="font-mono font-medium text-[#1D1D1F] dark:text-[#F8FAFC]">
                    {formatFCFA(prorataTuition)}
                  </span>
                </div>
                {formData.hasCanteen && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">
                      Cantine ({monthsEnrolled} mois) :
                    </span>
                    <span className="font-mono font-medium text-[#1D1D1F] dark:text-[#F8FAFC]">
                      {formatFCFA(canteenTotal)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#26334D] flex items-center justify-between text-sm font-bold">
                  <span className="text-[#1D1D1F] dark:text-[#F8FAFC]">Montant Total Dû :</span>
                  <span className="font-mono text-[#0071E3] dark:text-[#38BDF8]">
                    {formatFCFA(grandTotalDue)}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#26334D] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#1D1D1F] dark:text-[#F8FAFC] mb-1">
                      Premier versement immédiat (FCFA)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={formData.initialPaymentAmount}
                      onChange={(e) => setFormData({ ...formData, initialPaymentAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#151D2E] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#1D1D1F] dark:text-[#F8FAFC] mb-1">
                      Mode de paiement
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#151D2E] border border-[#E2E8F0] dark:border-[#26334D] text-[#1D1D1F] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    >
                      <option value="Espèces">Espèces (Guichet Caisse)</option>
                      <option value="Airtel Money">Airtel Money</option>
                      <option value="MTN Mobile Money">MTN Mobile Money</option>
                      <option value="Virement">Virement bancaire</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0] dark:border-[#222F46]">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#26334D] text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F4F5F7] dark:hover:bg-[#0F172A] transition-colors"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-all shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider & Enregistrer l'Inscription</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL ATTESTATION OFFICIELLE D'INSCRIPTION */}
      {attestationStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] max-w-xl w-full my-4 sm:my-8 p-6 sm:p-8 shadow-2xl space-y-6 text-black print:m-0 print:p-0 print:border-none print:shadow-none">
            {/* Header officiel République du Congo */}
            <div className="text-center space-y-1 pb-4 border-b-2 border-black">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#64748B]">
                {config?.schoolCountry || 'République du Congo'} • {config?.schoolDepartment || 'Ministère de l\'Enseignement'}
              </div>
              <div className="text-xl font-extrabold tracking-tight">
                {config?.schoolName || 'Complexe Scolaire Privé ADLON'}
              </div>
              <div className="text-xs text-[#64748B]">
                {config?.schoolCity || 'Brazzaville'}, {config?.schoolCountry || 'Congo'} • Année Académique {config?.academicYear || '2026-2027'}
                {config?.schoolPhone ? ` • Tél: ${config.schoolPhone}` : ''}
              </div>
            </div>

            <div className="text-center py-2">
              <span className="px-4 py-1 rounded-full border border-black text-xs font-bold uppercase tracking-wider">
                Attestation d'Inscription Officielle
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <p>
                Le Chef d'Établissement de <strong>{config?.schoolName || 'l\'Établissement Scolaire'}</strong> certifie par la présente que l'élève :
              </p>
              
              <div className="p-4 rounded-xl bg-[#F4F5F7] border border-[#E2E8F0] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Nom et Prénom :</span>
                  <strong className="text-black text-sm">{attestationStudent.firstName} {attestationStudent.lastName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Matricule scolaire :</span>
                  <span className="font-mono font-bold text-black">{attestationStudent.matricule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Cycle & Classe :</span>
                  <span className="font-semibold text-black">{attestationStudent.classLevel} ({attestationStudent.cycle})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Date d'admission :</span>
                  <span className="font-mono text-black">{attestationStudent.enrollmentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Régime de scolarité :</span>
                  <span className="font-medium text-black">
                    {attestationStudent.monthsEnrolled} mois ({attestationStudent.hasCanteen ? 'Demi-pensionnaire' : 'Externe'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Responsable légal :</span>
                  <span className="font-medium text-black">{attestationStudent.parentName} (+{config?.countryCode ? config.countryCode.replace('+', '') : '242'} {attestationStudent.parentPhone})</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-black/20 text-[11px] flex justify-between items-center">
                <span>Situation financière à l'inscription :</span>
                <span className="font-bold font-mono">
                  Payé : {formatFCFA(attestationStudent.totalPaid)} / {formatFCFA(attestationStudent.totalDue)}
                </span>
              </div>

              <p className="text-[11px] italic text-[#64748B]">
                En foi de quoi cette attestation lui est délivrée pour servir et valoir ce que de droit.
              </p>
            </div>

            {/* Signature & Cachet */}
            <div className="pt-6 flex justify-between items-end text-xs">
              <div>
                <p className="text-[10px] text-[#64748B]">Fait à {config?.schoolCity || 'la Direction'}, le {new Date().toLocaleDateString('fr-FR')}</p>
                <div className="mt-8 font-bold">Le Secrétariat des Admissions</div>
              </div>
              <div className="text-right">
                <div className="w-24 h-24 border-2 border-dashed border-black/30 rounded-full flex items-center justify-center text-[9px] uppercase font-bold text-black/40 rotate-[-12deg]">
                  Cachet Établissement
                </div>
                <div className="mt-2 font-bold">{config?.directorName || 'La Direction'}</div>
                <div className="text-[10px] text-[#64748B]">Direction de l'Établissement</div>
              </div>
            </div>

            {/* Action buttons (non imprimables) */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0] no-print">
              <button
                type="button"
                onClick={() => setAttestationStudent(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:bg-[#F4F5F7]"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold flex items-center gap-2 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer l'Attestation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
