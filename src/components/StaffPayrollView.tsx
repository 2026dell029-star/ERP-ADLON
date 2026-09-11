import React, { useState } from 'react';
import { StaffMember, SchoolConfig, StudentCycle, StaffRole } from '../types';
import { formatFCFA } from '../utils/formatters';
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
  Layers,
  Award
} from 'lucide-react';

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

export const StaffPayrollView: React.FC<StaffPayrollViewProps> = ({
  config,
  staff,
  onAddNewStaff,
  onUpdateStaff,
  onDeleteStaff,
  onUpdateConfig,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>('Enseignant');
  const [contractType, setContractType] = useState<'CDI' | 'CDD'>('CDI');
  const [monthlySalary, setMonthlySalary] = useState<number>(0);
  const [phone, setPhone] = useState('');
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [assignedGeneralText, setAssignedGeneralText] = useState('');

  // Delete modal confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPayroll = staff.reduce((acc, s) => acc + s.monthlySalary, 0);
  const effectivePayroll = config.monthlyFixedPayroll > 0 ? config.monthlyFixedPayroll : totalPayroll;
  const cashGap = config.availableBankCash - effectivePayroll;
  const isDeficit = effectivePayroll > 0 && cashGap < 0;
  const coverageRate = effectivePayroll > 0 
    ? Math.round((config.availableBankCash / effectivePayroll) * 100)
    : 100;

  // Build grouped classes list from config or defaults
  const classGroups = React.useMemo(() => {
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

  // Check if any assigned class belongs to Collège or Lycée
  const isSecondaryTeacher = React.useMemo(() => {
    if (role !== 'Enseignant') return false;
    return assignedClasses.some(className => {
      const lower = className.toLowerCase();
      return (
        lower.includes('6') || lower.includes('5') || lower.includes('4') || lower.includes('3') ||
        lower.includes('2nd') || lower.includes('1èr') || lower.includes('1er') ||
        lower.includes('term') || lower.includes('tle') || lower.includes('collège') || lower.includes('lycée')
      );
    });
  }, [role, assignedClasses]);

  const openAddModal = () => {
    setEditingStaff(null);
    setName('');
    setRole('Enseignant');
    setContractType('CDI');
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
    setMonthlySalary(member.monthlySalary);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    // Compute formatted summary for assignedGradeOrSubject
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

    if (editingStaff) {
      const updatedMember: StaffMember = {
        ...editingStaff,
        name,
        role,
        contractType,
        monthlySalary: Number(monthlySalary) || 0,
        assignedGradeOrSubject: formattedSummary,
        phone: phone || '',
        assignedClasses,
        assignedSubjects,
      };
      if (onUpdateStaff) {
        onUpdateStaff(updatedMember);
      } else {
        onAddNewStaff(updatedMember);
      }
    } else {
      const newMember: StaffMember = {
        id: `stf-${Date.now()}`,
        name,
        role,
        contractType,
        monthlySalary: Number(monthlySalary) || 0,
        assignedGradeOrSubject: formattedSummary,
        phone: phone || '',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'Actif',
        assignedClasses,
        assignedSubjects,
      };
      onAddNewStaff(newMember);
    }

    setShowForm(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingId && onDeleteStaff) {
      onDeleteStaff(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
            <Users2 className="w-5 h-5 text-[#0071E3]" />
            <span>Masse Salariale & Enseignants</span>
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Gestion du corps professoral, affectation multi-classes et matières (Collège / Lycée)
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

      {/* Metric Cards (Soft UI) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] shadow-xs">
          <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] block">Masse Salariale Mensuelle</span>
          <div className="text-2xl font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC] tracking-tight mt-1">
            {formatFCFA(totalPayroll)}
          </div>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">
            {staff.length} membre{staff.length > 1 ? 's' : ''} du personnel actif{staff.length > 1 ? 's' : ''}
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

      {/* FORM MODAL (Add or Edit Staff) */}
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
                    {editingStaff ? `Éditer le profil : ${editingStaff.name}` : 'Nouveau Collaborateur / Enseignant'}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Informations contractuelles et affectation par classe et matière
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
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
                    <option value="Enseignant">Enseignant (Professeur / Instit)</option>
                    <option value="Comptable">Comptable / Trésorier</option>
                    <option value="Directeur">Directeur / Chef d'Établissement</option>
                    <option value="Surveillant Général">Surveillant Général</option>
                    <option value="Secrétaire">Secrétaire / Téléphoniste</option>
                  </select>
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

                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Salaire Mensuel Net (FCFA) :
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={monthlySalary}
                      onChange={(e) => setMonthlySalary(Math.max(0, Number(e.target.value)))}
                      placeholder="0"
                      className="w-full p-2.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3] text-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#64748B] font-bold">FCFA</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
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
              </div>

              {/* DEDICATED TEACHER ASSIGNMENT PANEL */}
              {role === 'Enseignant' ? (
                <div className="p-4 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-blue-100 dark:border-[#222F46] space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#222F46] pb-2">
                    <h5 className="font-bold text-[#0071E3] dark:text-[#38BDF8] text-xs flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>Affectation des Classes & Matières (Moteur Pédagogique)</span>
                    </h5>
                    <span className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8] bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
                      Multi-Classes & Multi-Matières
                    </span>
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
                          className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          + Tout le Collège
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddAllCycleClasses('Lycée')}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-lg transition-colors"
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
                    {assignedClasses.length > 0 ? (
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
                    ) : (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        ⚠️ Aucune classe sélectionnée pour l'instant. Choisissez dans la liste déroulante ci-dessus.
                      </p>
                    )}
                  </div>

                  {/* 2. Secondary Specific Notice & Subject Selector */}
                  {isSecondaryTeacher ? (
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-[#222F46]">
                      <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200/70 dark:border-blue-800/60 space-y-1">
                        <div className="flex items-center gap-2 text-[#0071E3] dark:text-[#38BDF8] font-bold text-xs">
                          <Sparkles className="w-4 h-4" />
                          <span>Enseignant de Collège / Lycée (Vacataire / Prestataire par Matière)</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          Les enseignants du second cycle interviennent par spécialité disciplinaire dans plusieurs classes. Veuillez lui assigner les matières qu'il enseigne.
                        </p>
                      </div>

                      <div className="space-y-2">
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
                        {assignedSubjects.length > 0 ? (
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
                        ) : (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            💡 Veuillez ajouter au moins une matière enseignée par le professeur (ex: Mathématiques, SVT...).
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-200 dark:border-[#222F46] text-[11px] text-[#64748B]">
                      <p>
                        Pour le Préscolaire ou le Primaire, l'enseignant assure généralement l'enseignement général polyvalent dans la ou les classes sélectionnées.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Non-Teacher Assignment Field */
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
                  className="px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-[#222F46] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-2xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingStaff ? 'Enregistrer les modifications' : 'Créer le contrat d\'enseignant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL DELETE */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#151D2E] rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-200/80 dark:border-[#222F46] shadow-2xl">
            <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <span>Confirmer la suppression</span>
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Voulez-vous vraiment retirer ce collaborateur du registre et de la masse salariale ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#64748B]"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

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
            Total masse salariale : {formatFCFA(totalPayroll)} / mois
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
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] font-semibold border-b border-slate-200/80 dark:border-[#222F46]">
                <tr>
                  <th className="py-3 px-4">Collaborateur</th>
                  <th className="py-3 px-4">Fonction</th>
                  <th className="py-3 px-4">Contrat</th>
                  <th className="py-3 px-4">Classes & Matières Assignées</th>
                  <th className="py-3 px-4">Téléphone (+242)</th>
                  <th className="py-3 px-4 font-mono text-right">Salaire Mensuel</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-[#222F46]/60 text-[#0F172A] dark:text-[#F8FAFC]">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-xs">{s.name}</div>
                      <div className="text-[10px] text-[#64748B]">Engagé le {s.hireDate}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full font-semibold bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#38BDF8] text-[11px] inline-flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        <span>{s.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]">
                        {s.contractType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      {/* Rich visualization of assigned classes and subjects */}
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
                    <td className="py-3.5 px-4 font-mono text-[#64748B] dark:text-[#94A3B8]">
                      {s.phone ? `+${config.countryCode.replace('+', '')} ${s.phone}` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-right text-[#0F172A] dark:text-[#F8FAFC]">
                      {formatFCFA(s.monthlySalary)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(s)}
                          title="Modifier l'affectation"
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {onDeleteStaff && (
                          <button
                            onClick={() => setDeletingId(s.id)}
                            title="Supprimer le contrat"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
