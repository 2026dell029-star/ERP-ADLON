import React, { useState, useMemo, useEffect } from 'react';
import { StaffMember, SchoolConfig, StudentCycle, StaffRole, TimetableSlot, WeekDay } from '../types';
import { formatFCFA } from '../utils/formatters';
import {
  WEEK_DAYS,
  STANDARD_TIME_SLOTS,
  checkTimetableConflict,
  findAllTimetableConflicts,
  getTeacherWeeklyHours,
  getTeacherMonthlyHours,
  calculateTeacherMonthlySalary,
  calculateTeacherMonthlySalaryFromTimetable,
  calculateAllTeachersMonthlyVolume,
  calculateSlotDurationHours,
  timeToMinutes,
} from '../utils/timetableUtils';
import { 
  Users2, 
  Plus, 
  Wallet, 
  Phone,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  BookOpen,
  X,
  Pencil,
  Trash2,
  Sparkles,
  Calendar,
  Clock,
  Filter,
  Briefcase,
  UserCheck,
  ShieldAlert,
  Info,
  Check,
  Building,
  Layers,
  ChevronRight,
  FileText,
  Printer
} from 'lucide-react';
import { PayslipModal } from './PayslipModal';

interface StaffPayrollViewProps {
  config: SchoolConfig;
  staff: StaffMember[];
  onAddNewStaff: (newStaff: StaffMember) => void;
  onUpdateStaff?: (updatedStaff: StaffMember) => void;
  onDeleteStaff?: (staffId: string) => void;
  onUpdateConfig?: (updatedConfig: SchoolConfig) => void;
}

// List of standard secondary subjects for Collège & Lycée
const SECONDARY_SUBJECTS = [
  'Mathématiques',
  'Français & Expression Écrite',
  'Sciences Physiques & Chimie',
  'Sciences de la Vie et de la Terre (SVT)',
  'Histoire-Géographie',
  'Anglais',
  'Espagnol',
  'Allemand',
  'Philosophie',
  'Éducation Physique et Sportive (EPS)',
  'Informatique & Technologie',
  'Éducation Civique & Morale',
  'Économie & Droit',
  'Dessin & Arts Plastiques',
];

// Standard fallback classes if config has none
const DEFAULT_CLASS_GROUPS: { cycle: StudentCycle; classes: string[] }[] = [
  { cycle: 'Préscolaire', classes: ['Petite Section (PS)', 'Moyenne Section (MS)', 'Grande Section (GS)'] },
  { cycle: 'Primaire', classes: ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'] },
  { cycle: 'Collège', classes: ['6ème', '5ème', '4ème', '3ème'] },
  { cycle: 'Lycée', classes: ['2nde C', '2nde A', '1ère D', '1ère A', 'Terminale D', 'Terminale A', 'Terminale C'] },
];

const getCycleForClass = (
  className: string,
  groups: { cycle: StudentCycle; classes: string[] }[]
): StudentCycle => {
  for (const group of groups) {
    if (group.classes.includes(className)) {
      return group.cycle;
    }
  }
  const lower = className.toLowerCase();
  if (lower.includes('ps') || lower.includes('ms') || lower.includes('gs') || lower.includes('maternelle') || lower.includes('préscolaire')) return 'Préscolaire';
  if (lower.includes('cp') || lower.includes('ce') || lower.includes('cm') || lower.includes('primaire')) return 'Primaire';
  if (lower.includes('6') || lower.includes('5') || lower.includes('4') || lower.includes('3') || lower.includes('collège')) return 'Collège';
  if (lower.includes('2n') || lower.includes('1è') || lower.includes('term') || lower.includes('lycée')) return 'Lycée';
  return 'Collège';
};

export const StaffPayrollView: React.FC<StaffPayrollViewProps> = ({
  config,
  staff,
  onAddNewStaff,
  onUpdateStaff,
  onDeleteStaff,
  onUpdateConfig,
}) => {
  // Navigation Sub-Tabs: 'registry' (Personnel) or 'timetable' (Emploi du Temps)
  const [activeSubTab, setActiveSubTab] = useState<'registry' | 'timetable'>('registry');

  // Staff Modal & Form states
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // General Staff form inputs
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>('Enseignant');
  const [contractType, setContractType] = useState<'CDI' | 'CDD'>('CDI');
  const [payType, setPayType] = useState<'fixed' | 'hourly'>('fixed');
  const [hourlyRate, setHourlyRate] = useState<number>(2500);
  const [monthlySalary, setMonthlySalary] = useState<number>(0);
  const [phone, setPhone] = useState('');
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [assignedGeneralText, setAssignedGeneralText] = useState('');

  // Delete modal confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Payslip Modal State
  const [selectedPayslipStaff, setSelectedPayslipStaff] = useState<StaffMember | null>(null);

  // Timetable State
  const slots: TimetableSlot[] = useMemo(() => config.timetableSlots || [], [config.timetableSlots]);
  const [ttViewMode, setTtViewMode] = useState<'by_class' | 'by_teacher'>('by_class');
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<StudentCycle>('Collège');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('6ème');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('');

  // Global Timetable Conflicts Detection
  const globalConflicts = useMemo(() => findAllTimetableConflicts(slots), [slots]);

  // Timetable Slot Modal State
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotDay, setSlotDay] = useState<WeekDay>('Lundi');
  const [slotStartTime, setSlotStartTime] = useState('08:00');
  const [slotEndTime, setSlotEndTime] = useState('10:00');
  const [slotCycle, setSlotCycle] = useState<StudentCycle>('Collège');
  const [slotClassName, setSlotClassName] = useState('6ème');
  const [slotSubjectName, setSlotSubjectName] = useState('Mathématiques');
  const [slotTeacherId, setSlotTeacherId] = useState('');
  const [slotRoomNumber, setSlotRoomNumber] = useState('');
  const [slotConflictError, setSlotConflictError] = useState<string | null>(null);

  // Real-time live conflict detection inside slot modal
  const liveSlotConflict = useMemo(() => {
    if (!showSlotModal) return { hasConflict: false };
    const duration = calculateSlotDurationHours(slotStartTime, slotEndTime);
    if (duration <= 0) {
      return {
        hasConflict: true,
        message: "L'heure de fin doit être strictement supérieure à l'heure de début.",
      };
    }
    const assignedTeacher = staff.find(s => s.id === slotTeacherId);
    const teacherName = assignedTeacher ? assignedTeacher.name : 'Enseignant non spécifié';

    const candidateSlot: TimetableSlot = {
      id: editingSlotId || `slot-${Date.now()}`,
      day: slotDay,
      startTime: slotStartTime,
      endTime: slotEndTime,
      className: slotClassName,
      subjectName: slotSubjectName,
      teacherId: slotTeacherId,
      teacherName,
      roomNumber: slotRoomNumber || undefined,
    };

    return checkTimetableConflict(candidateSlot, slots);
  }, [
    showSlotModal,
    slotDay,
    slotStartTime,
    slotEndTime,
    slotClassName,
    slotSubjectName,
    slotTeacherId,
    slotRoomNumber,
    editingSlotId,
    staff,
    slots,
  ]);

  // Total payroll calculation
  const totalPayroll = staff.reduce((acc, s) => acc + s.monthlySalary, 0);
  const effectivePayroll = config.monthlyFixedPayroll > 0 ? config.monthlyFixedPayroll : totalPayroll;
  const cashGap = config.availableBankCash - effectivePayroll;
  const isDeficit = effectivePayroll > 0 && cashGap < 0;
  const coverageRate = effectivePayroll > 0 
    ? Math.round((config.availableBankCash / effectivePayroll) * 100)
    : 100;

  // Grouped classes from config or defaults
  const classGroups = useMemo(() => {
    if (config.classes && config.classes.length > 0) {
      const grouped: Record<string, string[]> = {
        'Préscolaire': [],
        'Primaire': [],
        'Collège': [],
        'Lycée': [],
      };
      config.classes.forEach(c => {
        if (!grouped[c.cycle]) grouped[c.cycle] = [];
        if (!grouped[c.cycle].includes(c.name)) grouped[c.cycle].push(c.name);
      });
      return Object.entries(grouped)
        .filter(([_, list]) => list.length > 0)
        .map(([cycle, list]) => ({ cycle: cycle as StudentCycle, classes: list }));
    }
    return DEFAULT_CLASS_GROUPS;
  }, [config.classes]);

  // List of all cycles available
  const availableCycles = useMemo(() => classGroups.map(g => g.cycle), [classGroups]);

  // Classes filtered by selected cycle in Timetable view
  const classesForSelectedCycleFilter = useMemo(() => {
    const group = classGroups.find(g => g.cycle === selectedCycleFilter);
    return group ? group.classes : [];
  }, [classGroups, selectedCycleFilter]);

  // Classes filtered by selected cycle in Slot Modal
  const classesForSlotCycle = useMemo(() => {
    const group = classGroups.find(g => g.cycle === slotCycle);
    return group ? group.classes : [];
  }, [classGroups, slotCycle]);

  // Secondary classes list (Collège & Lycée)
  const secondaryClasses = useMemo(() => {
    const list: string[] = [];
    classGroups.forEach(g => {
      if (g.cycle === 'Collège' || g.cycle === 'Lycée') {
        list.push(...g.classes);
      }
    });
    return list.length > 0 ? list : ['6ème', '5ème', '4ème', '3ème', '2nde C', '1ère D', 'Terminale D'];
  }, [classGroups]);

  // Secondary teachers list (Enseignants du Collège & Lycée)
  const secondaryTeachers = useMemo(() => {
    return staff.filter(s => {
      if (s.role !== 'Enseignant') return false;
      // If payType is hourly or has assigned secondary classes/subjects
      if (s.payType === 'hourly') return true;
      if (!s.assignedClasses || s.assignedClasses.length === 0) return true; // Include all teachers as default candidates
      return s.assignedClasses.some(cls => {
        const lower = cls.toLowerCase();
        return (
          lower.includes('6') || lower.includes('5') || lower.includes('4') || lower.includes('3') ||
          lower.includes('2nd') || lower.includes('1èr') || lower.includes('1er') ||
          lower.includes('term') || lower.includes('tle') || lower.includes('collège') || lower.includes('lycée')
        );
      });
    });
  }, [staff]);

  // Set default selected teacher if none selected
  useEffect(() => {
    if (!selectedTeacherFilter && secondaryTeachers.length > 0) {
      setSelectedTeacherFilter(secondaryTeachers[0].id);
    }
  }, [secondaryTeachers, selectedTeacherFilter]);

  // Sync selected class filter with selected cycle filter
  useEffect(() => {
    if (classesForSelectedCycleFilter.length > 0 && !classesForSelectedCycleFilter.includes(selectedClassFilter)) {
      setSelectedClassFilter(classesForSelectedCycleFilter[0]);
    }
  }, [classesForSelectedCycleFilter, selectedClassFilter]);

  // Check if assigned classes include Secondary
  const isSecondaryTeacher = useMemo(() => {
    if (role !== 'Enseignant') return false;
    if (assignedClasses.length === 0) return true;
    return assignedClasses.some(className => {
      const lower = className.toLowerCase();
      return (
        lower.includes('6') || lower.includes('5') || lower.includes('4') || lower.includes('3') ||
        lower.includes('2nd') || lower.includes('1èr') || lower.includes('1er') ||
        lower.includes('term') || lower.includes('tle') || lower.includes('collège') || lower.includes('lycée')
      );
    });
  }, [role, assignedClasses]);

  // Modal handlers
  const openAddModal = () => {
    setEditingStaff(null);
    setName('');
    setRole('Enseignant');
    setContractType('CDI');
    setPayType('fixed');
    setHourlyRate(2500);
    setMonthlySalary(0);
    setPhone('');
    setAssignedClasses([]);
    setAssignedSubjects([]);
    setCustomSubjectInput('');
    setAssignedGeneralText('');
    setShowForm(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    setName(member.name);
    setRole(member.role);
    setContractType(member.contractType);
    setPayType(member.payType || 'fixed');
    setHourlyRate(member.hourlyRate || 2500);
    setMonthlySalary(member.monthlySalary || 0);
    setPhone(member.phone);
    setAssignedClasses(member.assignedClasses || []);
    setAssignedSubjects(member.assignedSubjects || []);
    setCustomSubjectInput('');
    setAssignedGeneralText(member.assignedGradeOrSubject || '');
    setShowForm(true);
  };

  const handleToggleClass = (className: string) => {
    if (assignedClasses.includes(className)) {
      setAssignedClasses(assignedClasses.filter(c => c !== className));
    } else {
      setAssignedClasses([...assignedClasses, className]);
    }
  };

  const handleAddAllCycleClasses = (cycle: StudentCycle) => {
    const group = classGroups.find(g => g.cycle === cycle);
    if (!group) return;
    const newSet = new Set([...assignedClasses, ...group.classes]);
    setAssignedClasses(Array.from(newSet));
  };

  const handleToggleSubject = (subj: string) => {
    if (assignedSubjects.includes(subj)) {
      setAssignedSubjects(assignedSubjects.filter(s => s !== subj));
    } else {
      setAssignedSubjects([...assignedSubjects, subj]);
    }
  };

  const handleAddCustomSubject = () => {
    const trimmed = customSubjectInput.trim();
    if (trimmed && !assignedSubjects.includes(trimmed)) {
      setAssignedSubjects([...assignedSubjects, trimmed]);
      setCustomSubjectInput('');
    }
  };

  // Synchronize teacher salaries based on current slots
  const syncStaffSalariesWithTimetable = (updatedSlots: TimetableSlot[], currentStaff: StaffMember[]) => {
    return currentStaff.map(member => {
      if (member.payType === 'hourly') {
        const weeklyHours = getTeacherWeeklyHours(member.id, updatedSlots);
        const autoSalary = calculateTeacherMonthlySalary(member, weeklyHours);
        return {
          ...member,
          weeklyHours,
          monthlySalary: autoSalary,
        };
      }
      return member;
    });
  };

  // Submit Staff Member Form
  const handleSubmitStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    let formattedSummary = '';
    if (role === 'Enseignant') {
      const hasClasses = assignedClasses.length > 0;
      const hasSubjects = assignedSubjects.length > 0;

      if (hasSubjects && hasClasses) {
        formattedSummary = `${assignedSubjects.join(', ')} — (${assignedClasses.join(', ')})`;
      } else if (hasSubjects) {
        formattedSummary = `Matières : ${assignedSubjects.join(', ')}`;
      } else if (hasClasses) {
        formattedSummary = `Classes : ${assignedClasses.join(', ')}`;
      } else {
        formattedSummary = assignedGeneralText || 'Enseignement général';
      }
    } else {
      formattedSummary = assignedGeneralText || role;
    }

    const memberId = editingStaff ? editingStaff.id : `stf-${Date.now()}`;
    const calculatedWeeklyHours = payType === 'hourly' ? getTeacherWeeklyHours(memberId, slots) : 0;
    const finalMonthlySalary = payType === 'hourly'
      ? calculateTeacherMonthlySalary({ payType, hourlyRate }, calculatedWeeklyHours)
      : Number(monthlySalary) || 0;

    const baseMember: StaffMember = {
      id: memberId,
      name,
      role,
      contractType,
      monthlySalary: finalMonthlySalary,
      assignedGradeOrSubject: formattedSummary,
      phone: phone || '',
      hireDate: editingStaff ? editingStaff.hireDate : new Date().toISOString().split('T')[0],
      status: editingStaff ? editingStaff.status : 'Actif',
      assignedClasses,
      assignedSubjects,
      payType,
      hourlyRate: payType === 'hourly' ? Number(hourlyRate) || 2500 : undefined,
      weeklyHours: calculatedWeeklyHours,
    };

    if (editingStaff) {
      if (onUpdateStaff) onUpdateStaff(baseMember);
      else onAddNewStaff(baseMember);
    } else {
      onAddNewStaff(baseMember);
    }

    setShowForm(false);
  };

  // Delete Staff Member
  const handleDeleteConfirm = () => {
    if (deletingId && onDeleteStaff) {
      onDeleteStaff(deletingId);
      // Remove any timetable slots for deleted teacher
      const updatedSlots = slots.filter(s => s.teacherId !== deletingId);
      if (onUpdateConfig) {
        onUpdateConfig({ ...config, timetableSlots: updatedSlots });
      }
      setDeletingId(null);
    }
  };

  // ================= TIMETABLE SLOT HANDLERS =================
  const openAddSlotModal = (defaultDay?: WeekDay, defaultClass?: string) => {
    setEditingSlotId(null);
    setSlotDay(defaultDay || 'Lundi');
    setSlotStartTime('08:00');
    setSlotEndTime('10:00');

    const targetClass = defaultClass || selectedClassFilter || secondaryClasses[0] || '6ème';
    const targetCycle = getCycleForClass(targetClass, classGroups);
    setSlotCycle(targetCycle);
    setSlotClassName(targetClass);

    setSlotSubjectName('Mathématiques');
    setSlotTeacherId(secondaryTeachers[0]?.id || staff[0]?.id || '');
    setSlotRoomNumber('');
    setSlotConflictError(null);
    setShowSlotModal(true);
  };

  const openEditSlotModal = (slot: TimetableSlot) => {
    setEditingSlotId(slot.id);
    setSlotDay(slot.day);
    setSlotStartTime(slot.startTime);
    setSlotEndTime(slot.endTime);

    const slotTargetCycle = getCycleForClass(slot.className, classGroups);
    setSlotCycle(slotTargetCycle);
    setSlotClassName(slot.className);

    setSlotSubjectName(slot.subjectName);
    setSlotTeacherId(slot.teacherId);
    setSlotRoomNumber(slot.roomNumber || '');
    setSlotConflictError(null);
    setShowSlotModal(true);
  };

  const handleDeleteSlot = (slotId: string) => {
    const updatedSlots = slots.filter(s => s.id !== slotId);
    if (onUpdateConfig) {
      onUpdateConfig({ ...config, timetableSlots: updatedSlots });
    }
    // Update staff salaries for hourly teachers
    const updatedStaff = syncStaffSalariesWithTimetable(updatedSlots, staff);
    updatedStaff.forEach(s => {
      if (s.payType === 'hourly' && onUpdateStaff) {
        onUpdateStaff(s);
      }
    });
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setSlotConflictError(null);

    // Basic time checks
    const duration = calculateSlotDurationHours(slotStartTime, slotEndTime);
    if (duration <= 0) {
      setSlotConflictError("L'heure de fin doit être strictement supérieure à l'heure de début.");
      return;
    }

    const assignedTeacher = staff.find(s => s.id === slotTeacherId);
    const teacherName = assignedTeacher ? assignedTeacher.name : 'Enseignant non spécifié';

    const candidateSlot: TimetableSlot = {
      id: editingSlotId || `slot-${Date.now()}`,
      day: slotDay,
      startTime: slotStartTime,
      endTime: slotEndTime,
      className: slotClassName,
      subjectName: slotSubjectName,
      teacherId: slotTeacherId,
      teacherName,
      roomNumber: slotRoomNumber || undefined,
    };

    // STRICT CONFLICT CHECKING (Anti-double booking class & Anti-double booking teacher)
    const conflictResult = checkTimetableConflict(candidateSlot, slots);
    if (conflictResult.hasConflict) {
      setSlotConflictError(conflictResult.message || 'Conflit d\'emploi du temps détecté.');
      return;
    }

    // Save slot
    let updatedSlots: TimetableSlot[] = [];
    if (editingSlotId) {
      updatedSlots = slots.map(s => s.id === editingSlotId ? candidateSlot : s);
    } else {
      updatedSlots = [...slots, candidateSlot];
    }

    if (onUpdateConfig) {
      onUpdateConfig({ ...config, timetableSlots: updatedSlots });
    }

    // Recompute hourly teachers' weekly hours and monthly salaries
    const updatedStaff = syncStaffSalariesWithTimetable(updatedSlots, staff);
    updatedStaff.forEach(s => {
      if (s.payType === 'hourly' && onUpdateStaff) {
        onUpdateStaff(s);
      }
    });

    setShowSlotModal(false);
  };

  // Automated monthly volume & salary summary calculation for all teachers from timetable
  const teachersMonthlySummary = useMemo(() => {
    return calculateAllTeachersMonthlyVolume(staff, slots);
  }, [staff, slots]);

  // Filtered slots for timetable rendering
  const filteredClassSlots = useMemo(() => {
    return slots.filter(s => s.className === selectedClassFilter);
  }, [slots, selectedClassFilter]);

  const filteredTeacherSlots = useMemo(() => {
    return slots.filter(s => s.teacherId === selectedTeacherFilter);
  }, [slots, selectedTeacherFilter]);

  const activeTeacher = useMemo(() => {
    return staff.find(s => s.id === selectedTeacherFilter);
  }, [staff, selectedTeacherFilter]);

  const activeTeacherWeeklyHours = useMemo(() => {
    if (!selectedTeacherFilter) return 0;
    return getTeacherWeeklyHours(selectedTeacherFilter, slots);
  }, [selectedTeacherFilter, slots]);

  const activeTeacherMonthlyHours = useMemo(() => {
    if (!selectedTeacherFilter) return 0;
    return getTeacherMonthlyHours(selectedTeacherFilter, slots);
  }, [selectedTeacherFilter, slots]);

  const activeTeacherMonthlySalary = useMemo(() => {
    if (!activeTeacher) return 0;
    return calculateTeacherMonthlySalaryFromTimetable(activeTeacher, slots);
  }, [activeTeacher, slots]);

  return (
    <div className="space-y-6">
      {/* TOP SUB-NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#151D2E] p-3 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#0071E3] dark:text-[#38BDF8]">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
              <span>Gestion du Personnel & Emploi du Temps</span>
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Cycle Collège & Lycée : Professeurs prestataires, planning fixe & calcul automatique du salaire
            </p>
          </div>
        </div>

        {/* Sub-Tab Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#222F46] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('registry')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'registry'
                ? 'bg-white dark:bg-[#151D2E] text-[#0071E3] dark:text-[#38BDF8] shadow-xs border border-slate-200/80 dark:border-[#222F46]'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>Registre du Personnel ({staff.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('timetable')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'timetable'
                ? 'bg-white dark:bg-[#151D2E] text-[#0071E3] dark:text-[#38BDF8] shadow-xs border border-slate-200/80 dark:border-[#222F46]'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Emploi du Temps ({slots.length} cours)</span>
            {slots.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: REGISTRE DU PERSONNEL & SALAIRES */}
      {/* ==================================================================== */}
      {activeSubTab === 'registry' && (
        <div className="space-y-6">
          {/* Top Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#0071E3]" />
                <span>Registre Officiel & Masse Salariale globale</span>
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Contrats CDI/CDD fixes et profs prestataires au taux horaire (Collège / Lycée)
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Collaborateur / Enseignant</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] shadow-xs">
              <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] block">Masse Salariale Mensuelle</span>
              <div className="text-2xl font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC] tracking-tight mt-1">
                {formatFCFA(totalPayroll)}
              </div>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">
                {staff.length} membre{staff.length > 1 ? 's' : ''} actif{staff.length > 1 ? 's' : ''} • ({staff.filter(s => s.payType === 'hourly').length} prestataires à l'heure)
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] shadow-xs">
              <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] block">Trésorerie Disponible</span>
              <div className="text-2xl font-bold font-mono text-[#0071E3] dark:text-[#38BDF8] tracking-tight mt-1">
                {formatFCFA(config.availableBankCash)}
              </div>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">
                Solde en banque configuré
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] shadow-xs">
              <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] block">Couverture de Paie</span>
              <div className={`text-2xl font-bold font-mono tracking-tight mt-1 ${isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {coverageRate}%
              </div>
              <span className={`text-[11px] font-semibold block mt-1 ${isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {effectivePayroll === 0 ? '0 FCFA (Sans engagement)' : isDeficit ? `Écart : ${formatFCFA(Math.abs(cashGap))}` : 'Paie provisionnée'}
              </span>
            </div>
          </div>

          {/* STAFF REGISTRY TABLE */}
          <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-[#222F46] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                  <span>Registre du Personnel & Enseignants</span>
                  <span className="text-xs font-normal text-[#64748B] dark:text-[#94A3B8]">
                    ({staff.length} inscrit{staff.length > 1 ? 's' : ''})
                  </span>
                </h3>
              </div>
              <span className="text-xs font-mono font-semibold text-[#0071E3] dark:text-[#38BDF8]">
                Total paie mensuelle : {formatFCFA(totalPayroll)}
              </span>
            </div>

            <div className="overflow-x-auto">
              {staff.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0071E3] flex items-center justify-center mx-auto">
                    <Users2 className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                    Aucun collaborateur ni enseignant enregistré pour l'instant.
                  </p>
                  <button
                    onClick={openAddModal}
                    className="px-4 py-2 rounded-xl bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0077ED] transition-colors"
                  >
                    + Enregistrer le premier enseignant
                  </button>
                </div>
              ) : (
                <table className="w-full text-left text-xs min-w-[800px]">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] font-semibold border-b border-slate-200/80 dark:border-[#222F46]">
                    <tr>
                      <th className="py-3 px-4">Collaborateur</th>
                      <th className="py-3 px-4">Fonction & Mode</th>
                      <th className="py-3 px-4">Classes & Matières Assignées</th>
                      <th className="py-3 px-4 text-center">Volume Horaire Hebdo</th>
                      <th className="py-3 px-4 text-right">Taux Horaire / Fixe</th>
                      <th className="py-3 px-4 font-mono text-right">Salaire Mensuel Calculated</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-[#222F46]/60 text-[#0F172A] dark:text-[#F8FAFC]">
                    {staff.map((s) => {
                      const summary = teachersMonthlySummary[s.id];
                      const teacherWeeklyHours = summary ? summary.weeklyHours : getTeacherWeeklyHours(s.id, slots);
                      const teacherMonthlyHours = summary ? summary.monthlyHours : getTeacherMonthlyHours(s.id, slots);
                      const isHourly = s.payType === 'hourly';

                      return (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-xs">{s.name}</div>
                            <div className="text-[10px] text-[#64748B]">
                              Tél : {s.phone ? `+${config.countryCode.replace('+', '')} ${s.phone}` : 'N/A'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className="px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#38BDF8] text-[11px] inline-flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                <span>{s.role}</span>
                              </span>
                              <div>
                                {isHourly ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Prestataire à l'heure</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]">
                                    {s.contractType} (Fixe)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 space-y-1">
                            {s.assignedSubjects && s.assignedSubjects.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] font-semibold text-[#64748B]">Matières:</span>
                                {s.assignedSubjects.map((sub) => (
                                  <span
                                    key={sub}
                                    className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0071E3] dark:text-[#38BDF8] font-bold text-[10px]"
                                  >
                                    {sub}
                                  </span>
                                ))}
                              </div>
                            )}
                            {s.assignedClasses && s.assignedClasses.length > 0 && (
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] font-semibold text-[#64748B]">Classes:</span>
                                {s.assignedClasses.map((cls) => (
                                  <span
                                    key={cls}
                                    className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px]"
                                  >
                                    {cls}
                                  </span>
                                ))}
                              </div>
                            )}
                            {(!s.assignedClasses || s.assignedClasses.length === 0) &&
                             (!s.assignedSubjects || s.assignedSubjects.length === 0) && (
                              <span className="text-[#64748B] dark:text-[#94A3B8] font-medium text-xs">
                                {s.assignedGradeOrSubject || 'Enseignement général'}
                              </span>
                            )}
                          </td>

                          {/* Volume horaire hebdomadaire et mensuel */}
                          <td className="py-3.5 px-4 text-center">
                            {s.role === 'Enseignant' ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]">
                                  {teacherWeeklyHours}h / semaine
                                </span>
                                <span className="font-mono font-bold text-[10px] text-[#0071E3] dark:text-[#38BDF8]">
                                  ≈ {teacherMonthlyHours}h / mois
                                </span>
                                <span className="text-[10px] text-[#64748B]">
                                  {summary ? summary.slotCount : slots.filter(sl => sl.teacherId === s.id).length} cours placés
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#64748B] text-[11px]">—</span>
                            )}
                          </td>

                          {/* Taux horaire */}
                          <td className="py-3.5 px-4 text-right">
                            {isHourly ? (
                              <div>
                                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                                  {formatFCFA(s.hourlyRate || 2500)} / h
                                </span>
                                <span className="text-[10px] text-[#64748B] block">Taux prestataire</span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Forfait fixe</span>
                            )}
                          </td>

                          {/* Salaire Mensuel Calculé */}
                          <td className="py-3.5 px-4 font-mono font-bold text-right text-[#0F172A] dark:text-[#F8FAFC]">
                            <span className={isHourly ? 'text-[#0071E3] dark:text-[#38BDF8]' : ''}>
                              {formatFCFA(s.monthlySalary)}
                            </span>
                            {isHourly && (
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-sans font-semibold">
                                ({teacherMonthlyHours}h/mois × {formatFCFA(s.hourlyRate || 2500)})
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedPayslipStaff(s)}
                                title="Générer Fiche de Paie PDF"
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              >
                                <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Fiche de Paie</span>
                              </button>
                              <button
                                onClick={() => openEditModal(s)}
                                title="Modifier le profil & salaire"
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              {onDeleteStaff && (
                                <button
                                  onClick={() => setDeletingId(s.id)}
                                  title="Supprimer du registre"
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: EMPLOI DU TEMPS HEBDOMADAIRE (COLLÈGE & LYCÉE) */}
      {/* ==================================================================== */}
      {activeSubTab === 'timetable' && (
        <div className="space-y-6">
          {/* View Mode Toolbar */}
          <div className="bg-white dark:bg-[#151D2E] p-4 rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#222F46] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#0071E3]" />
                  <span>Emploi du Temps Hebdomadaire Fixe (Collège / Lycée)</span>
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Anti-chevauchement strict : deux enseignants ne peuvent pas avoir cours au même moment dans une même classe.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex p-1 bg-slate-100 dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#222F46]">
                  <button
                    type="button"
                    onClick={() => setTtViewMode('by_class')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      ttViewMode === 'by_class'
                        ? 'bg-white dark:bg-[#151D2E] text-[#0071E3] shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                    }`}
                  >
                    Vue par Classe
                  </button>
                  <button
                    type="button"
                    onClick={() => setTtViewMode('by_teacher')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      ttViewMode === 'by_teacher'
                        ? 'bg-white dark:bg-[#151D2E] text-[#0071E3] shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                    }`}
                  >
                    Vue par Enseignant
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => openAddSlotModal()}
                  className="px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold rounded-2xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Programmer un Cours</span>
                </button>
              </div>
            </div>

            {/* Global Timetable Validation Banner */}
            {globalConflicts.length === 0 ? (
              <div className="p-3 px-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    <strong>Système de Validation d'Emploi du Temps Actif :</strong> Aucun conflit ni chevauchement d'enseignant/classe détecté.
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] shrink-0">
                  Valide ✓
                </span>
              </div>
            ) : (
              <div className="p-3.5 px-4 rounded-2xl bg-rose-50/90 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-medium space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-100">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Alerte Validation : {globalConflicts.length} conflit(s) de réservation d'heures détecté(s) !</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-bold text-[10px]">
                    Action Requise ⚠️
                  </span>
                </div>
                <ul className="space-y-1 pl-6 list-disc text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                  {globalConflicts.map((c, idx) => (
                    <li key={idx}>{c.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Filter Selector Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              {ttViewMode === 'by_class' ? (
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  {/* Cycle Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] shrink-0">
                      1. Cycle :
                    </label>
                    <select
                      value={selectedCycleFilter}
                      onChange={(e) => {
                        const newCycle = e.target.value as StudentCycle;
                        setSelectedCycleFilter(newCycle);
                        const cycleGroup = classGroups.find(g => g.cycle === newCycle);
                        if (cycleGroup && cycleGroup.classes.length > 0) {
                          setSelectedClassFilter(cycleGroup.classes[0]);
                        }
                      }}
                      className="p-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs font-bold text-[#0071E3] dark:text-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    >
                      {availableCycles.map(cName => (
                        <option key={cName} value={cName}>
                          Cycle {cName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Class Selector (Filtered by Selected Cycle) */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] shrink-0">
                      2. Classe :
                    </label>
                    <select
                      value={selectedClassFilter}
                      onChange={(e) => setSelectedClassFilter(e.target.value)}
                      className="p-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs font-bold text-[#0071E3] dark:text-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    >
                      {classesForSelectedCycleFilter.map(cName => (
                        <option key={cName} value={cName}>
                          Classe {cName} ({slots.filter(s => s.className === cName).length} cours)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] shrink-0">
                    Choisir l'Enseignant :
                  </label>
                  <select
                    value={selectedTeacherFilter}
                    onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                    className="p-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs font-bold text-[#0071E3] dark:text-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  >
                    {secondaryTeachers.length === 0 ? (
                      <option value="">Aucun enseignant du second cycle</option>
                    ) : (
                      secondaryTeachers.map(t => {
                        const summary = teachersMonthlySummary[t.id];
                        const wHours = summary ? summary.weeklyHours : getTeacherWeeklyHours(t.id, slots);
                        const mHours = summary ? summary.monthlyHours : getTeacherMonthlyHours(t.id, slots);
                        return (
                          <option key={t.id} value={t.id}>
                            {t.name} ({wHours}h/sem • {mHours}h/mois)
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
              )}

              {/* Summary Stats for Current View Selection */}
              <div className="p-2.5 px-4 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200/70 dark:border-blue-800/60 text-xs flex flex-wrap items-center gap-4">
                {ttViewMode === 'by_class' ? (
                  <>
                    <div>
                      <span className="text-[#64748B] text-[11px] block">Volume Hebdo Classe :</span>
                      <strong className="font-mono text-[#0071E3] dark:text-[#38BDF8] font-bold">
                        {filteredClassSlots.reduce((sum, s) => sum + calculateSlotDurationHours(s.startTime, s.endTime), 0)} heures / semaine
                      </strong>
                    </div>
                    <div className="h-6 w-px bg-blue-200 dark:bg-blue-800/60 hidden sm:block" />
                    <div>
                      <span className="text-[#64748B] text-[11px] block">Nombre de Cours :</span>
                      <strong className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {filteredClassSlots.length} créneaux
                      </strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-[#64748B] text-[11px] block">Volume Hebdomadaire :</span>
                      <strong className="font-mono text-[#0071E3] dark:text-[#38BDF8] font-bold text-sm">
                        {activeTeacherWeeklyHours}h / semaine
                      </strong>
                    </div>
                    <div className="h-6 w-px bg-blue-200 dark:bg-blue-800/60 hidden sm:block" />
                    <div>
                      <span className="text-[#64748B] text-[11px] block">Volume Mensuel Estimé :</span>
                      <strong className="font-mono text-[#0071E3] dark:text-[#38BDF8] font-bold text-sm">
                        {activeTeacherMonthlyHours}h / mois
                      </strong>
                    </div>
                    <div className="h-6 w-px bg-blue-200 dark:bg-blue-800/60 hidden sm:block" />
                    <div>
                      <span className="text-[#64748B] text-[11px] block">Mode de Paie :</span>
                      <strong className="font-bold text-amber-600 dark:text-amber-400">
                        {activeTeacher?.payType === 'hourly'
                          ? `Prestataire (${formatFCFA(activeTeacher.hourlyRate || 2500)}/h)`
                          : 'Salaire Fixe'}
                      </strong>
                    </div>
                    <div className="h-6 w-px bg-blue-200 dark:bg-blue-800/60 hidden sm:block" />
                    <div>
                      <span className="text-[#64748B] text-[11px] block">Salaire Mensuel Automatique :</span>
                      <strong className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatFCFA(activeTeacherMonthlySalary)} / mois
                      </strong>
                    </div>

                    {activeTeacher && (
                      <>
                        <div className="h-6 w-px bg-blue-200 dark:bg-blue-800/60 hidden sm:block" />
                        <button
                          type="button"
                          onClick={() => setSelectedPayslipStaff(activeTeacher)}
                          className="px-3 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Fiche de Paie PDF</span>
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* TIMETABLE WEEKLY GRID (Lundi à Samedi) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {WEEK_DAYS.map((day) => {
              const daySlots = (ttViewMode === 'by_class' ? filteredClassSlots : filteredTeacherSlots)
                .filter(s => s.day === day)
                .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

              const totalDayHours = daySlots.reduce((sum, s) => sum + calculateSlotDurationHours(s.startTime, s.endTime), 0);

              return (
                <div
                  key={day}
                  className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] p-3.5 shadow-xs flex flex-col justify-between space-y-3"
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#222F46] pb-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0071E3]" />
                      <span className="font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]">{day}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#64748B] bg-slate-100 dark:bg-[#0F172A] px-2 py-0.5 rounded-full">
                      {totalDayHours > 0 ? `${totalDayHours}h` : 'Libre'}
                    </span>
                  </div>

                  {/* Day Slots List */}
                  <div className="space-y-2 flex-1 min-h-[140px]">
                    {daySlots.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-3 text-[#64748B] dark:text-[#94A3B8]">
                        <Clock className="w-5 h-5 mb-1 opacity-40" />
                        <span className="text-[11px] font-medium">Aucun cours ce jour</span>
                        <button
                          type="button"
                          onClick={() => openAddSlotModal(day)}
                          className="mt-2 text-[10px] font-bold text-[#0071E3] hover:underline cursor-pointer"
                        >
                          + Ajouter un créneau
                        </button>
                      </div>
                    ) : (
                      daySlots.map((slot) => {
                        const duration = calculateSlotDurationHours(slot.startTime, slot.endTime);

                        return (
                          <div
                            key={slot.id}
                            className="p-2.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-blue-100 dark:border-[#222F46] hover:border-[#0071E3] transition-all space-y-1.5 relative group"
                          >
                            {/* Time Badge */}
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono font-bold text-[#0071E3] dark:text-[#38BDF8] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200/50">
                                {slot.startTime} - {slot.endTime} ({duration}h)
                              </span>
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => openEditSlotModal(slot)}
                                  className="p-1 hover:text-[#0071E3] text-slate-400 cursor-pointer"
                                  title="Modifier le cours"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="p-1 hover:text-rose-500 text-slate-400 cursor-pointer"
                                  title="Supprimer le créneau"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Subject */}
                            <div className="font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC] leading-tight">
                              {slot.subjectName}
                            </div>

                            {/* Info context depending on view mode */}
                            <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] space-y-0.5">
                              {ttViewMode === 'by_class' ? (
                                <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                  <GraduationCap className="w-3 h-3 text-[#0071E3]" />
                                  <span>{slot.teacherName}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                                  <Building className="w-3 h-3" />
                                  <span>Classe : {slot.className}</span>
                                </div>
                              )}
                              {slot.roomNumber && (
                                <div className="text-[9px]">Salle : {slot.roomNumber}</div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Slot Quick Button for this Day */}
                  <button
                    type="button"
                    onClick={() => openAddSlotModal(day)}
                    className="w-full py-1.5 px-2 bg-slate-50 dark:bg-[#0F172A] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-400 hover:text-[#0071E3] text-[10px] font-bold rounded-xl border border-dashed border-slate-200 dark:border-[#222F46] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Ajouter sur {day}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: CRÉER / ÉDITER COLLABORATEUR & SALAIRE PRESTATAIRE */}
      {/* ==================================================================== */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#151D2E] rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-[#222F46] space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#222F46] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0071E3] dark:text-[#38BDF8]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {editingStaff ? `Profil : ${editingStaff.name}` : 'Nouveau Collaborateur / Enseignant'}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Informations contractuelles, mode de rémunération et affectation des cours
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitStaff} className="space-y-5 text-xs">
              {/* General Staff Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Nom & Prénom du collaborateur <span className="text-rose-500">*</span> :
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: M. MBOUNGOU Jean"
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Fonction / Rôle <span className="text-rose-500">*</span> :
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] text-sm font-semibold"
                  >
                    <option value="Enseignant">Enseignant (Professeur / Vacataire / Instit)</option>
                    <option value="Comptable">Comptable / Trésorier</option>
                    <option value="Directeur">Directeur / Chef d'Établissement</option>
                    <option value="Surveillant Général">Surveillant Général</option>
                    <option value="Secrétaire">Secrétaire / Téléphoniste</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Téléphone Direct (+242 Congo) :
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="ex: 066123456"
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Type de Contrat :
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] text-sm"
                  >
                    <option value="CDI">CDI (Titulaire / Permanent)</option>
                    <option value="CDD">CDD (Contrat à durée déterminée)</option>
                  </select>
                </div>
              </div>

              {/* PAYMODE SELECTOR (Salaire Fixe vs Prestataire au Taux Horaire) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] space-y-3">
                <label className="block font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Mode de Rémunération :
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setPayType('fixed')}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      payType === 'fixed'
                        ? 'bg-white dark:bg-[#151D2E] border-[#0071E3] ring-1 ring-[#0071E3]'
                        : 'border-slate-200 dark:border-[#222F46]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payType"
                      checked={payType === 'fixed'}
                      onChange={() => setPayType('fixed')}
                      className="mt-0.5 text-[#0071E3]"
                    />
                    <div>
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block">Salaire Fixe Mensuel</span>
                      <span className="text-[11px] text-[#64748B] block">Forfait mensuel prédéfini (ex: Primaire / Administration)</span>
                    </div>
                  </label>

                  <label
                    onClick={() => setPayType('hourly')}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      payType === 'hourly'
                        ? 'bg-white dark:bg-[#151D2E] border-[#0071E3] ring-1 ring-[#0071E3]'
                        : 'border-slate-200 dark:border-[#222F46]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payType"
                      checked={payType === 'hourly'}
                      onChange={() => setPayType('hourly')}
                      className="mt-0.5 text-[#0071E3]"
                    />
                    <div>
                      <span className="font-bold text-amber-600 dark:text-amber-400 block flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Prestataire au Taux Horaire</span>
                      </span>
                      <span className="text-[11px] text-[#64748B] block">
                        Collège / Lycée : Calculé auto selon les heures d'emploi du temps
                      </span>
                    </div>
                  </label>
                </div>

                {/* Conditional Fields depending on payType */}
                {payType === 'fixed' ? (
                  <div>
                    <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                      Salaire Mensuel Net Fixe (FCFA) :
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        value={monthlySalary}
                        onChange={(e) => setMonthlySalary(Math.max(0, Number(e.target.value)))}
                        placeholder="0"
                        className="w-full p-2.5 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3] text-sm"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-[#64748B] font-bold">FCFA</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-[#222F46]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                          Taux Horaire (FCFA / heure) :
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={500}
                            step={250}
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(Math.max(0, Number(e.target.value)))}
                            className="w-full p-2.5 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3] text-sm text-amber-600 dark:text-amber-400"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-[#64748B] font-bold">FCFA / h</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200/60 flex flex-col justify-center">
                        <span className="text-[11px] text-[#64748B] block">Heures Hebdo Cumulées :</span>
                        <span className="font-mono font-bold text-[#0071E3] dark:text-[#38BDF8] text-sm">
                          {editingStaff ? getTeacherWeeklyHours(editingStaff.id, slots) : 0} heures / semaine
                        </span>
                        <span className="text-[10px] text-[#64748B]">Calculé d'après l'emploi du temps</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        Salaire Mensuel Estimé :
                      </span>
                      <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                        {formatFCFA(
                          calculateTeacherMonthlySalary(
                            { payType: 'hourly', hourlyRate },
                            editingStaff ? getTeacherWeeklyHours(editingStaff.id, slots) : 0
                          )
                        )} / mois
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* DEDICATED TEACHER ASSIGNMENT PANEL */}
              {role === 'Enseignant' ? (
                <div className="p-4 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-blue-100 dark:border-[#222F46] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#222F46] pb-2">
                    <h5 className="font-bold text-[#0071E3] dark:text-[#38BDF8] text-xs flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>Affectation des Classes & Matières (Collège / Lycée)</span>
                    </h5>
                  </div>

                  {/* 1. Classes Selection Dropdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        Sélectionner la ou les Classes d'intervention :
                      </label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddAllCycleClasses('Collège')}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                        >
                          + Tout le Collège
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddAllCycleClasses('Lycée')}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          + Tout le Lycée
                        </button>
                      </div>
                    </div>

                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleToggleClass(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full p-2.5 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] text-xs"
                    >
                      <option value="">-- Choisir une classe à ajouter... --</option>
                      {classGroups.map((group) => (
                        <optgroup key={group.cycle} label={`--- ${group.cycle} ---`}>
                          {group.classes.map((cName) => (
                            <option key={cName} value={cName}>
                              {cName} {assignedClasses.includes(cName) ? '✓ (Déjà ajoutée)' : ''}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>

                    {/* Selected Classes Badges */}
                    {assignedClasses.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {assignedClasses.map((cName) => (
                          <span
                            key={cName}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200/70 dark:border-indigo-800/60"
                          >
                            <span>{cName}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleClass(cName)}
                              className="hover:text-rose-600 text-indigo-400 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Subject Selector */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#222F46]">
                    <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      Choisir les Matières Enseignées :
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleToggleSubject(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full p-2.5 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] text-xs"
                    >
                      <option value="">-- Choisir une matière dans la liste... --</option>
                      {SECONDARY_SUBJECTS.map((subj) => (
                        <option key={subj} value={subj}>
                          {subj} {assignedSubjects.includes(subj) ? '✓ (Sélectionnée)' : ''}
                        </option>
                      ))}
                    </select>

                    {/* Custom Subject Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSubjectInput}
                        onChange={(e) => setCustomSubjectInput(e.target.value)}
                        placeholder="Autre matière (ex: Dessin Technique, Latin...)"
                        className="flex-1 p-2 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSubject}
                        className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-[#0F172A] dark:text-[#F8FAFC] font-semibold rounded-xl text-xs cursor-pointer"
                      >
                        + Ajouter
                      </button>
                    </div>

                    {/* Selected Subjects Badges */}
                    {assignedSubjects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {assignedSubjects.map((subj) => (
                          <span
                            key={subj}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0071E3] dark:text-[#38BDF8] font-bold text-xs border border-blue-200/70 dark:border-blue-800/60"
                          >
                            <span>{subj}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleSubject(subj)}
                              className="hover:text-rose-600 text-blue-400 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Description du Poste / Services d'affectation :
                  </label>
                  <input
                    type="text"
                    value={assignedGeneralText}
                    onChange={(e) => setAssignedGeneralText(e.target.value)}
                    placeholder="ex: Gestion de la caisse centrale, Discipline générale..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] text-sm"
                  />
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-[#222F46]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-[#222F46] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-2xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingStaff ? 'Enregistrer les modifications' : 'Enregistrer le collaborateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: PROGRAMMER / ÉDITER UN CRÉNEAU D'EMPLOI DU TEMPS */}
      {/* ==================================================================== */}
      {showSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#151D2E] rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-[#222F46] space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#222F46] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#0071E3] dark:text-[#38BDF8]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {editingSlotId ? 'Modifier le Créneau de Cours' : 'Programmer un Nouveau Cours'}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Définition du jour, des horaires, de la classe et de l'enseignant
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSlotModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conflict Alert Box (Live & On Submit) */}
            {(slotConflictError || liveSlotConflict.hasConflict) && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-100">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Validation anti-chevauchement : Conflit Détecté !</span>
                </div>
                <p className="pl-6 text-[11px] leading-relaxed">
                  {slotConflictError || liveSlotConflict.message}
                </p>
              </div>
            )}

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              {/* Day Selection */}
              <div>
                <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Jour de la semaine :
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {WEEK_DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setSlotDay(d);
                        setSlotConflictError(null);
                      }}
                      className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                        slotDay === d
                          ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                          : 'bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-[#222F46] text-[#0F172A] dark:text-[#F8FAFC]'
                      }`}
                    >
                      {d.substring(0, 3)}.
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Range Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Heure Début :
                  </label>
                  <select
                    value={slotStartTime}
                    onChange={(e) => {
                      setSlotStartTime(e.target.value);
                      setSlotConflictError(null);
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] font-mono font-bold text-xs"
                  >
                    {STANDARD_TIME_SLOTS.map(t => (
                      <option key={`start-${t.start}`} value={t.start}>{t.start}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Heure Fin :
                  </label>
                  <select
                    value={slotEndTime}
                    onChange={(e) => {
                      setSlotEndTime(e.target.value);
                      setSlotConflictError(null);
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] font-mono font-bold text-xs"
                  >
                    {STANDARD_TIME_SLOTS.map(t => (
                      <option key={`end-${t.end}`} value={t.end}>{t.end}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl text-[11px] text-[#64748B] flex items-center justify-between">
                <span>Durée du créneau :</span>
                <strong className="font-mono text-[#0071E3] font-bold">
                  {calculateSlotDurationHours(slotStartTime, slotEndTime)} heures
                </strong>
              </div>

              {/* Cycle & Class Selection (Cascading Cycle -> Class) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    1. Sélectionner le Cycle <span className="text-rose-500">*</span> :
                  </label>
                  <select
                    value={slotCycle}
                    onChange={(e) => {
                      const newCycle = e.target.value as StudentCycle;
                      setSlotCycle(newCycle);
                      const cycleClasses = classGroups.find(g => g.cycle === newCycle)?.classes || [];
                      if (cycleClasses.length > 0) {
                        setSlotClassName(cycleClasses[0]);
                      }
                      setSlotConflictError(null);
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs focus:ring-2 focus:ring-[#0071E3]"
                  >
                    {availableCycles.map(cName => (
                      <option key={cName} value={cName}>
                        Cycle {cName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    2. Choisir la Classe ({slotCycle}) <span className="text-rose-500">*</span> :
                  </label>
                  <select
                    value={slotClassName}
                    onChange={(e) => {
                      setSlotClassName(e.target.value);
                      setSlotConflictError(null);
                    }}
                    className={`w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] border rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] font-bold text-xs ${
                      liveSlotConflict.hasConflict && liveSlotConflict.conflictType === 'class'
                        ? 'border-rose-500 dark:border-rose-600 bg-rose-50/30'
                        : 'border-slate-200/80 dark:border-[#222F46]'
                    }`}
                  >
                    {classesForSlotCycle.length === 0 ? (
                      <option value="">Aucune classe dans ce cycle</option>
                    ) : (
                      classesForSlotCycle.map(cName => (
                        <option key={cName} value={cName}>
                          Classe {cName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Teacher Selection */}
              <div>
                <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Enseignant Titulaire du cours <span className="text-rose-500">*</span> :
                </label>
                <select
                  value={slotTeacherId}
                  onChange={(e) => {
                    setSlotTeacherId(e.target.value);
                    setSlotConflictError(null);
                  }}
                  className={`w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] border rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs ${
                    liveSlotConflict.hasConflict && liveSlotConflict.conflictType === 'teacher'
                      ? 'border-rose-500 dark:border-rose-600 bg-rose-50/30'
                      : 'border-slate-200/80 dark:border-[#222F46]'
                  }`}
                >
                  {staff.length === 0 ? (
                    <option value="">Aucun enseignant créé</option>
                  ) : (
                    staff.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.assignedSubjects?.length ? `(${t.assignedSubjects.join(', ')})` : ''} {t.payType === 'hourly' ? '— Prestataire' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Matière Enseignée <span className="text-rose-500">*</span> :
                </label>
                <select
                  value={slotSubjectName}
                  onChange={(e) => setSlotSubjectName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs"
                >
                  {SECONDARY_SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Room Number */}
              <div>
                <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Numéro de Salle (optionnel) :
                </label>
                <input
                  type="text"
                  value={slotRoomNumber}
                  onChange={(e) => setSlotRoomNumber(e.target.value)}
                  placeholder="ex: Salle 04, Labo Physique..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-[#222F46]">
                <button
                  type="button"
                  onClick={() => setShowSlotModal(false)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-[#222F46] text-[#64748B] font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={liveSlotConflict.hasConflict}
                  className={`px-5 py-2.5 font-semibold rounded-2xl shadow-xs transition-colors cursor-pointer ${
                    liveSlotConflict.hasConflict
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                      : 'bg-[#0071E3] hover:bg-[#0077ED] text-white'
                  }`}
                >
                  {liveSlotConflict.hasConflict
                    ? 'Créneau non disponible'
                    : (editingSlotId ? 'Modifier le créneau' : 'Valider & Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYSLIP DETAILED MODAL */}
      {selectedPayslipStaff && (
        <PayslipModal
          staff={selectedPayslipStaff}
          config={config}
          slots={slots}
          onClose={() => setSelectedPayslipStaff(null)}
        />
      )}

      {/* CONFIRMATION MODAL DELETE STAFF */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#151D2E] rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-200/80 dark:border-[#222F46] shadow-2xl">
            <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <span>Confirmer la suppression</span>
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Voulez-vous vraiment retirer ce collaborateur du registre ? Ses créneaux d'emploi du temps seront également effacés.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#64748B] cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
