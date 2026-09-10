import React, { useState, useMemo } from 'react';
import { SchoolConfig, ClassDefinition, SubjectDefinition, StudentCycle } from '../types';
import { formatFCFA, getClassMonthlyTuition, getClassAnnualTuition } from '../utils/formatters';
import { 
  Settings, 
  Check, 
  Plus, 
  Trash2, 
  BookOpen, 
  School, 
  Award, 
  Layers, 
  ChevronRight, 
  Sparkles, 
  Copy, 
  Filter, 
  Users, 
  DoorClosed, 
  Edit3, 
  Hash,
  AlertCircle,
  Calendar,
  DollarSign,
  Calculator,
  TrendingUp,
  Coins,
  Search,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ConfigViewProps {
  config: SchoolConfig;
  onSaveConfig: (updatedConfig: SchoolConfig) => void;
}

const CYCLES: { id: StudentCycle; name: string; icon: string; desc: string; color: string; defaultMonthly: number }[] = [
  { id: 'Préscolaire', name: 'Cycle Préscolaire', icon: '🧸', desc: 'Maternelle (PS, MS, GS)', color: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400', defaultMonthly: 15000 },
  { id: 'Primaire', name: 'Cycle Primaire', icon: '🎒', desc: 'Du CP1 au CM2', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400', defaultMonthly: 18000 },
  { id: 'Collège', name: 'Cycle Collège', icon: '📐', desc: 'De la 6ème à la 3ème (BEPC)', color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400', defaultMonthly: 25000 },
  { id: 'Lycée', name: 'Cycle Lycée', icon: '🎓', desc: '2nde, 1ère, Terminale (BAC)', color: 'from-purple-500/10 to-violet-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400', defaultMonthly: 35000 },
];

const STANDARD_CURRICULUM_TEMPLATES: Record<StudentCycle, { name: string; coefficient: number; category: 'Scientifique' | 'Littéraire' | 'Sport & Arts' | 'Vie Scolaire' | 'Autre' }[]> = {
  'Préscolaire': [
    { name: 'Langage & Expression Orale', coefficient: 2, category: 'Littéraire' },
    { name: 'Graphisme & Écriture', coefficient: 2, category: 'Sport & Arts' },
    { name: 'Éveil Sensoriel & Mathématique', coefficient: 2, category: 'Scientifique' },
    { name: 'Motricité & Coordination', coefficient: 1, category: 'Sport & Arts' },
    { name: 'Socialisation & Tenue', coefficient: 1, category: 'Vie Scolaire' },
  ],
  'Primaire': [
    { name: 'Français & Orthographe', coefficient: 3, category: 'Littéraire' },
    { name: 'Mathématiques & Calcul', coefficient: 3, category: 'Scientifique' },
    { name: 'Sciences d\'Observation & Éveil', coefficient: 2, category: 'Scientifique' },
    { name: 'Histoire & Géographie', coefficient: 1, category: 'Littéraire' },
    { name: 'Éducation Civique & Morale', coefficient: 1, category: 'Vie Scolaire' },
    { name: 'Éducation Physique (EPS)', coefficient: 1, category: 'Sport & Arts' },
    { name: 'Conduite & Tenue', coefficient: 1, category: 'Vie Scolaire' },
  ],
  'Collège': [
    { name: 'Mathématiques', coefficient: 4, category: 'Scientifique' },
    { name: 'Français / Expression Écrite', coefficient: 4, category: 'Littéraire' },
    { name: 'Sciences de la Vie et de la Terre (SVT)', coefficient: 2, category: 'Scientifique' },
    { name: 'Sciences Physiques & Chimie', coefficient: 2, category: 'Scientifique' },
    { name: 'Histoire-Géographie', coefficient: 2, category: 'Littéraire' },
    { name: 'Anglais', coefficient: 2, category: 'Littéraire' },
    { name: 'Éducation Physique (EPS)', coefficient: 1, category: 'Sport & Arts' },
    { name: 'Conduite & Assiduité', coefficient: 1, category: 'Vie Scolaire' },
  ],
  'Lycée': [
    { name: 'Mathématiques', coefficient: 5, category: 'Scientifique' },
    { name: 'Sciences Physiques & Chimie', coefficient: 5, category: 'Scientifique' },
    { name: 'Sciences de la Vie et de la Terre (SVT)', coefficient: 5, category: 'Scientifique' },
    { name: 'Philosophie & Littérature', coefficient: 3, category: 'Littéraire' },
    { name: 'Histoire-Géographie', coefficient: 2, category: 'Littéraire' },
    { name: 'Anglais', coefficient: 2, category: 'Littéraire' },
    { name: 'Éducation Physique (EPS)', coefficient: 1, category: 'Sport & Arts' },
    { name: 'Conduite & Discipline', coefficient: 1, category: 'Vie Scolaire' },
  ],
};

export const ConfigView: React.FC<ConfigViewProps> = ({ config, onSaveConfig }) => {
  const [formData, setFormData] = useState<SchoolConfig>(() => ({
    ...config,
    classes: config.classes || [
      { id: 'cls-1', name: 'Petite Section (PS)', cycle: 'Préscolaire', monthlyTuition: 15000, mainTeacher: 'Mme Brigitte Bouesso', roomNumber: 'M01', maxCapacity: 20 },
      { id: 'cls-2', name: 'CE2', cycle: 'Primaire', monthlyTuition: 18000, mainTeacher: 'Mme Brigitte Bouesso', roomNumber: 'P04', maxCapacity: 30 },
      { id: 'cls-3', name: '3ème', cycle: 'Collège', monthlyTuition: 25000, mainTeacher: 'M. Aimé Loubaki', roomNumber: 'C04', maxCapacity: 35 },
      { id: 'cls-4', name: 'Terminale D', cycle: 'Lycée', monthlyTuition: 35000, mainTeacher: 'M. Aimé Loubaki', roomNumber: 'L03', maxCapacity: 35 },
    ],
    classSubjects: config.classSubjects || {}
  }));

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'structure' | 'general' | 'tuition'>('tuition');

  // Selected Cycle for pedagogical structure
  const [selectedCycle, setSelectedCycle] = useState<StudentCycle>('Primaire');

  // Selected Class in the active cycle
  const currentCycleClasses = (formData.classes || []).filter((c) => c.cycle === selectedCycle);
  const defaultSelectedClass = currentCycleClasses.length > 0 ? currentCycleClasses[0].name : '';
  const [selectedClassName, setSelectedClassName] = useState<string>(defaultSelectedClass || 'CE2');

  // New class modal / inline form state
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassTeacher, setNewClassTeacher] = useState('');
  const [newClassRoom, setNewClassRoom] = useState('');
  const [newClassCapacity, setNewClassCapacity] = useState<number>(30);
  const [newClassMonthlyTuition, setNewClassMonthlyTuition] = useState<number>(18000);

  // New subject inline state
  const [newSubName, setNewSubName] = useState('');
  const [newSubCoeff, setNewSubCoeff] = useState<number>(3);
  const [newSubCategory, setNewSubCategory] = useState<'Scientifique' | 'Littéraire' | 'Sport & Arts' | 'Vie Scolaire' | 'Autre'>('Scientifique');
  const [newSubTeacher, setNewSubTeacher] = useState('');

  // Quick Duplicate subject modal / state
  const [duplicateSourceClass, setDuplicateSourceClass] = useState<string>('');

  // Tuition tab filters and batch tools
  const [tuitionCycleFilter, setTuitionCycleFilter] = useState<string>('all');
  const [tuitionSearch, setTuitionSearch] = useState<string>('');
  const [batchCycle, setBatchCycle] = useState<StudentCycle>('Primaire');
  const [batchAmount, setBatchAmount] = useState<number>(18000);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string>('');

  // Sync selected class if cycle changes and selected class is no longer in current cycle
  const handleCycleSelect = (cycle: StudentCycle) => {
    setSelectedCycle(cycle);
    const cycleDefaults = CYCLES.find(c => c.id === cycle);
    if (cycleDefaults) {
      setNewClassMonthlyTuition(cycleDefaults.defaultMonthly);
    }
    const classesInNewCycle = (formData.classes || []).filter((c) => c.cycle === cycle);
    if (classesInNewCycle.length > 0) {
      setSelectedClassName(classesInNewCycle[0].name);
    } else {
      setSelectedClassName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Update Monthly Tuition for a specific class
  const handleUpdateClassMonthlyTuition = (classId: string, monthlyAmount: number) => {
    const updatedClasses = (formData.classes || []).map((c) =>
      c.id === classId ? { ...c, monthlyTuition: Math.max(0, monthlyAmount) } : c
    );
    setFormData((prev) => ({
      ...prev,
      classes: updatedClasses,
    }));
  };

  // Batch apply monthly fee to all classes in a specific cycle
  const handleApplyBatchTuition = (cycle: StudentCycle, monthlyAmount: number) => {
    const updatedClasses = (formData.classes || []).map((c) =>
      c.cycle === cycle ? { ...c, monthlyTuition: Math.max(0, monthlyAmount) } : c
    );
    setFormData((prev) => ({
      ...prev,
      classes: updatedClasses,
    }));
    setBatchSuccessMessage(`Tarif de ${formatFCFA(monthlyAmount)}/mois appliqué à toutes les classes du cycle ${cycle} !`);
    setTimeout(() => setBatchSuccessMessage(''), 3500);
  };

  // Add Class to currently selected cycle
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClassObj: ClassDefinition = {
      id: `cls-${Date.now()}`,
      name: newClassName.trim(),
      cycle: selectedCycle,
      monthlyTuition: Number(newClassMonthlyTuition) || CYCLES.find(c => c.id === selectedCycle)?.defaultMonthly || 18000,
      mainTeacher: newClassTeacher.trim() || 'Enseignant non assigné',
      roomNumber: newClassRoom.trim() || 'Salle standard',
      maxCapacity: Number(newClassCapacity) || 30,
    };

    // Pre-populate with standard template subjects for this cycle if empty
    const templateSubs = STANDARD_CURRICULUM_TEMPLATES[selectedCycle].map((tpl, i) => ({
      id: `sub-${Date.now()}-${i}`,
      classLevel: newClassObj.name,
      name: tpl.name,
      coefficient: tpl.coefficient,
      category: tpl.category,
      defaultTeacher: newClassObj.mainTeacher,
    }));

    const updatedClasses = [...(formData.classes || []), newClassObj];
    const updatedSubjects = {
      ...(formData.classSubjects || {}),
      [newClassObj.name]: templateSubs,
    };

    setFormData((prev) => ({
      ...prev,
      classes: updatedClasses,
      classSubjects: updatedSubjects,
    }));

    setNewClassName('');
    setNewClassTeacher('');
    setNewClassRoom('');
    setSelectedClassName(newClassObj.name);
    setIsAddClassOpen(false);
  };

  const handleDeleteClass = (classId: string, className: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la classe "${className}" et ses matières associées ?`)) {
      return;
    }
    const updatedClasses = (formData.classes || []).filter((c) => c.id !== classId);
    const updatedSubjects = { ...(formData.classSubjects || {}) };
    delete updatedSubjects[className];

    setFormData((prev) => ({
      ...prev,
      classes: updatedClasses,
      classSubjects: updatedSubjects,
    }));

    const remainingInCycle = updatedClasses.filter((c) => c.cycle === selectedCycle);
    if (remainingInCycle.length > 0) {
      setSelectedClassName(remainingInCycle[0].name);
    } else {
      setSelectedClassName('');
    }
  };

  // Add Subject to currently selected class
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !selectedClassName) return;

    const currentSubs = formData.classSubjects?.[selectedClassName] || [];
    const newSubObj: SubjectDefinition = {
      id: `sub-${Date.now()}`,
      classLevel: selectedClassName,
      name: newSubName.trim(),
      coefficient: Math.max(1, Number(newSubCoeff) || 1),
      category: newSubCategory,
      defaultTeacher: newSubTeacher.trim() || undefined,
    };

    setFormData((prev) => ({
      ...prev,
      classSubjects: {
        ...(prev.classSubjects || {}),
        [selectedClassName]: [...currentSubs, newSubObj],
      },
    }));

    setNewSubName('');
    setNewSubCoeff(3);
    setNewSubTeacher('');
  };

  const handleDeleteSubject = (subId: string) => {
    if (!selectedClassName) return;
    const currentSubs = formData.classSubjects?.[selectedClassName] || [];
    const updatedSubs = currentSubs.filter((s) => s.id !== subId);
    setFormData((prev) => ({
      ...prev,
      classSubjects: {
        ...(prev.classSubjects || {}),
        [selectedClassName]: updatedSubs,
      },
    }));
  };

  const handleUpdateSubjectCoefficient = (subId: string, newCoeff: number) => {
    if (!selectedClassName) return;
    const currentSubs = formData.classSubjects?.[selectedClassName] || [];
    const updatedSubs = currentSubs.map((s) =>
      s.id === subId ? { ...s, coefficient: Math.max(1, Number(newCoeff) || 1) } : s
    );
    setFormData((prev) => ({
      ...prev,
      classSubjects: {
        ...(prev.classSubjects || {}),
        [selectedClassName]: updatedSubs,
      },
    }));
  };

  // Import standard template for selected class
  const handleImportStandardCurriculum = () => {
    if (!selectedClassName) return;
    const template = STANDARD_CURRICULUM_TEMPLATES[selectedCycle] || [];
    const currentClassObj = formData.classes?.find((c) => c.name === selectedClassName);
    const newSubs = template.map((tpl, i) => ({
      id: `sub-${Date.now()}-${i}`,
      classLevel: selectedClassName,
      name: tpl.name,
      coefficient: tpl.coefficient,
      category: tpl.category,
      defaultTeacher: currentClassObj?.mainTeacher || 'Enseignant Titulaire',
    }));

    setFormData((prev) => ({
      ...prev,
      classSubjects: {
        ...(prev.classSubjects || {}),
        [selectedClassName]: newSubs,
      },
    }));
  };

  // Duplicate subjects from another class
  const handleDuplicateFromClass = (sourceClass: string) => {
    if (!sourceClass || !selectedClassName) return;
    const sourceSubs = formData.classSubjects?.[sourceClass] || [];
    const duplicated = sourceSubs.map((sub, i) => ({
      ...sub,
      id: `sub-${Date.now()}-${i}`,
      classLevel: selectedClassName,
    }));

    setFormData((prev) => ({
      ...prev,
      classSubjects: {
        ...(prev.classSubjects || {}),
        [selectedClassName]: duplicated,
      },
    }));
    setDuplicateSourceClass('');
  };

  // Filtered classes in tuition tab
  const filteredTuitionClasses = useMemo(() => {
    return (formData.classes || []).filter((cls) => {
      const matchesCycle = tuitionCycleFilter === 'all' || cls.cycle === tuitionCycleFilter;
      const matchesSearch = 
        cls.name.toLowerCase().includes(tuitionSearch.toLowerCase()) ||
        cls.cycle.toLowerCase().includes(tuitionSearch.toLowerCase()) ||
        (cls.mainTeacher && cls.mainTeacher.toLowerCase().includes(tuitionSearch.toLowerCase()));
      return matchesCycle && matchesSearch;
    });
  }, [formData.classes, tuitionCycleFilter, tuitionSearch]);

  // Computed metrics for tuition
  const totalClassesCount = (formData.classes || []).length;
  const averageMonthlyFee = totalClassesCount > 0 
    ? Math.round((formData.classes || []).reduce((sum, c) => sum + (c.monthlyTuition || 18000), 0) / totalClassesCount)
    : 0;
  const averageAnnualFee = averageMonthlyFee * formData.schoolDurationMonths;
  const totalSchoolCapacity = (formData.classes || []).reduce((sum, c) => sum + (c.maxCapacity || 30), 0);
  const totalPotentialRevenue = (formData.classes || []).reduce((sum, c) => {
    const monthly = c.monthlyTuition || 18000;
    const capacity = c.maxCapacity || 30;
    return sum + (monthly * formData.schoolDurationMonths * capacity);
  }, 0);

  // Computed metrics for active class in structure tab
  const activeClassSubjects = selectedClassName ? (formData.classSubjects?.[selectedClassName] || []) : [];
  const activeClassTotalCoeff = activeClassSubjects.reduce((sum, s) => sum + s.coefficient, 0);
  const activeClassObj = formData.classes?.find((c) => c.name === selectedClassName);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#151D2E] p-5 rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#38BDF8] text-[11px] font-bold uppercase tracking-wider">
              Architecture & Tarification
            </span>
            <span className="text-xs text-slate-400 font-medium">• Système Éducatif Congolais</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
            Configuration de l'Établissement & Grille Tarifaire par Classe
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Définissez les mensualités par classe, le nombre de mois de l'année scolaire, et la structure pédagogique.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-in fade-in shadow-xs shrink-0">
            <Check className="w-4 h-4" />
            <span>Paramètres enregistrés avec succès !</span>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80 dark:border-[#222F46]">
        <button
          type="button"
          onClick={() => setActiveTab('tuition')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'tuition'
              ? 'bg-[#0071E3] text-white shadow-xs scale-[1.02]'
              : 'bg-white dark:bg-[#151D2E] text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200/80 dark:border-[#222F46]'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Grille Tarifaire par Classe ({formData.schoolDurationMonths} mois)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('structure')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'structure'
              ? 'bg-[#0071E3] text-white shadow-xs scale-[1.02]'
              : 'bg-white dark:bg-[#151D2E] text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200/80 dark:border-[#222F46]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Structure Pédagogique (Cycle ➔ Classe ➔ Matières)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'general'
              ? 'bg-[#0071E3] text-white shadow-xs scale-[1.02]'
              : 'bg-white dark:bg-[#151D2E] text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200/80 dark:border-[#222F46]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Informations Générales de l'École</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: GRILLE TARIFAIRE PAR CLASSE & DURÉE SCOLAIRE (PRIMARY FOCUS)     */}
        {/* ========================================================================= */}
        {activeTab === 'tuition' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. KEY PARAMETER BANNER: DURATION & FORMULA */}
            <div className="p-6 bg-gradient-to-br from-blue-900/10 via-white to-slate-50 dark:from-[#0071E3]/20 dark:via-[#151D2E] dark:to-[#0F172A] rounded-3xl border border-[#0071E3]/30 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-2xl bg-[#0071E3] text-white shadow-xs">
                      <Calculator className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        Règle de Calcul Automatique : Montant Mensuel × Durée en Mois
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        Chaque classe possède son tarif pour <strong>1 mois</strong>. Le total annuel facturé pour 1 élève est automatiquement déduit selon le nombre de mois d'école.
                      </p>
                    </div>
                  </div>
                </div>

                {/* School Duration Selector Control */}
                <div className="bg-white dark:bg-[#151D2E] p-3 rounded-2xl border border-slate-200/80 dark:border-[#222F46] flex items-center gap-3 shrink-0 shadow-xs">
                  <Calendar className="w-4 h-4 text-[#0071E3]" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">
                      Durée de l'année scolaire
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, schoolDurationMonths: Math.max(1, prev.schoolDurationMonths - 1) }))}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-[#0F172A] text-[#0F172A] dark:text-white font-bold text-xs flex items-center justify-center hover:bg-slate-200"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-sm text-[#0071E3] dark:text-[#38BDF8] min-w-[3.5rem] text-center">
                        {formData.schoolDurationMonths} mois
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, schoolDurationMonths: Math.min(12, prev.schoolDurationMonths + 1) }))}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-[#0F172A] text-[#0F172A] dark:text-white font-bold text-xs flex items-center justify-center hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="border-l border-slate-200 dark:border-[#222F46] pl-3 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, schoolDurationMonths: 10 }))}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        formData.schoolDurationMonths === 10
                          ? 'bg-[#0071E3] text-white'
                          : 'bg-slate-100 dark:bg-[#0F172A] text-[#64748B]'
                      }`}
                    >
                      10 mois
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, schoolDurationMonths: 9 }))}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        formData.schoolDurationMonths === 9
                          ? 'bg-[#0071E3] text-white'
                          : 'bg-slate-100 dark:bg-[#0F172A] text-[#64748B]'
                      }`}
                    >
                      9 mois
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-white dark:bg-[#151D2E] rounded-2xl border border-slate-200/80 dark:border-[#222F46]">
                  <div className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Classes Configurées</div>
                  <div className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] font-mono mt-0.5">
                    {totalClassesCount} classes
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#151D2E] rounded-2xl border border-slate-200/80 dark:border-[#222F46]">
                  <div className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Mensualité Moyenne</div>
                  <div className="text-lg font-bold text-[#0071E3] dark:text-[#38BDF8] font-mono mt-0.5">
                    {formatFCFA(averageMonthlyFee)}
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#151D2E] rounded-2xl border border-slate-200/80 dark:border-[#222F46]">
                  <div className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                    Total Annuel Moyen / Élève
                  </div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {formatFCFA(averageAnnualFee)}
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#151D2E] rounded-2xl border border-slate-200/80 dark:border-[#222F46]">
                  <div className="text-[10px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                    Potentiel Facturation ({totalSchoolCapacity} places)
                  </div>
                  <div className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] font-mono mt-0.5">
                    {formatFCFA(totalPotentialRevenue)}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. BATCH APPLY & CYCLE FILTERS TOOLBAR */}
            <div className="p-5 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Cycle Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setTuitionCycleFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      tuitionCycleFilter === 'all'
                        ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] shadow-xs'
                        : 'bg-slate-100 dark:bg-[#0F172A] text-[#64748B] hover:bg-slate-200'
                    }`}
                  >
                    Toutes les classes ({totalClassesCount})
                  </button>
                  {CYCLES.map((c) => {
                    const count = (formData.classes || []).filter(cl => cl.cycle === c.id).length;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setTuitionCycleFilter(c.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          tuitionCycleFilter === c.id
                            ? 'bg-[#0071E3] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-[#0F172A] text-[#64748B] hover:bg-slate-200'
                        }`}
                      >
                        <span>{c.icon}</span>
                        <span>{c.id} ({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Search by class name */}
                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrer une classe (ex: CE2)..."
                    value={tuitionSearch}
                    onChange={(e) => setTuitionSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
              </div>

              {/* Batch Apply Tool to quickly set monthly rate for a full cycle */}
              <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#222F46] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    Application rapide par lot :
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-[#64748B]">Fixer tout le cycle</span>
                  <select
                    value={batchCycle}
                    onChange={(e) => {
                      const cyc = e.target.value as StudentCycle;
                      setBatchCycle(cyc);
                      const def = CYCLES.find(c => c.id === cyc)?.defaultMonthly || 18000;
                      setBatchAmount(def);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
                  >
                    <option value="Préscolaire">Préscolaire</option>
                    <option value="Primaire">Primaire</option>
                    <option value="Collège">Collège</option>
                    <option value="Lycée">Lycée</option>
                  </select>

                  <span className="text-[11px] text-[#64748B]">à :</span>
                  <input
                    type="number"
                    step={1000}
                    min={5000}
                    value={batchAmount}
                    onChange={(e) => setBatchAmount(Number(e.target.value))}
                    className="w-28 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] text-xs font-mono font-bold text-[#0071E3] dark:text-[#38BDF8]"
                  />
                  <span className="text-xs font-bold text-[#64748B]">FCFA/mois</span>

                  <button
                    type="button"
                    onClick={() => handleApplyBatchTuition(batchCycle, batchAmount)}
                    className="px-3 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-all shadow-xs"
                  >
                    Appliquer au {batchCycle}
                  </button>
                </div>
              </div>

              {batchSuccessMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{batchSuccessMessage}</span>
                </div>
              )}
            </div>

            {/* 3. INTERACTIVE CLASS-BY-CLASS PRICING TABLE */}
            <div className="p-6 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-[#222F46] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                    <Coins className="w-4 h-4 text-[#0071E3]" />
                    <span>Grille Tarifaire Détaillée par Classe ({filteredTuitionClasses.length})</span>
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Entrez le tarif pour 1 mois. Le total annuel pour 1 élève est immédiatement recalculé ({formData.schoolDurationMonths} mois).
                  </p>
                </div>

                <span className="text-xs font-mono font-bold text-[#0071E3] dark:text-[#38BDF8]">
                  Base Annuelle : × {formData.schoolDurationMonths} mois
                </span>
              </div>

              {filteredTuitionClasses.length === 0 ? (
                <div className="p-8 text-center bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-dashed border-slate-200/80 dark:border-[#222F46]">
                  <p className="text-xs font-semibold text-slate-500">Aucune classe ne correspond aux filtres.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTuitionClasses.map((cls) => {
                    const monthly = cls.monthlyTuition || 18000;
                    const annual = monthly * formData.schoolDurationMonths;
                    const classCapacity = cls.maxCapacity || 30;
                    const totalClassAnnualRevenue = annual * classCapacity;
                    const cycleData = CYCLES.find(c => c.id === cls.cycle);

                    return (
                      <div
                        key={cls.id || cls.name}
                        className="p-4 rounded-2xl border border-slate-200/80 dark:border-[#222F46] bg-[#F8FAFC] dark:bg-[#0F172A] space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                      >
                        {/* Class Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{cycleData?.icon || '🏫'}</span>
                            <div>
                              <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                                {cls.name}
                              </div>
                              <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                                {cls.cycle} • Salle {cls.roomNumber || 'P01'} • {classCapacity} élèves max
                              </div>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-[#0071E3] dark:text-[#38BDF8] border border-blue-200 dark:border-blue-900">
                            {cls.mainTeacher ? cls.mainTeacher.split(' ').slice(0, 2).join(' ') : 'Titulaire'}
                          </span>
                        </div>

                        {/* Interactive Monthly Rate Input & Instant Annual Calculation */}
                        <div className="p-3 bg-white dark:bg-[#151D2E] rounded-xl border border-slate-200/80 dark:border-[#222F46] space-y-2.5">
                          <div>
                            <div className="flex justify-between items-center text-[11px] mb-1">
                              <label className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                                Montant à payer pour 1 mois :
                              </label>
                              <span className="text-[10px] text-[#64748B] font-mono">
                                Base mensuelle élève
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  step={1000}
                                  min={0}
                                  value={monthly}
                                  onChange={(e) => handleUpdateClassMonthlyTuition(cls.id, Number(e.target.value))}
                                  className="w-full p-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-xl font-mono font-bold text-sm text-[#0071E3] dark:text-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                                />
                                <span className="absolute right-3 top-2 text-[11px] font-bold text-[#64748B]">
                                  FCFA / mois
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateClassMonthlyTuition(cls.id, Math.max(0, monthly - 1000))}
                                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                                  title="-1 000 FCFA"
                                >
                                  -1k
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateClassMonthlyTuition(cls.id, monthly + 1000)}
                                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                                  title="+1 000 FCFA"
                                >
                                  +1k
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Annual Total Outcome */}
                          <div className="pt-2 border-t border-slate-100 dark:border-[#222F46] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-[#64748B] dark:text-[#94A3B8]">
                              <span>Formule :</span>
                              <span className="font-mono text-[#0F172A] dark:text-[#F8FAFC] font-semibold">
                                {formatFCFA(monthly)} × {formData.schoolDurationMonths} mois
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-[#64748B] block">Total Annuel / Élève :</span>
                              <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                                {formatFCFA(annual)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Class Revenue projection */}
                        <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] px-1">
                          <span>Prévisionnel annuel classe ({classCapacity} élèves) :</span>
                          <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            {formatFCFA(totalClassAnnualRevenue)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. FRAIS ANNEXES : INSCRIPTION & CANTINE */}
            <div className="p-6 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] border-b border-slate-200/80 dark:border-[#222F46] pb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0071E3]" />
                <span>Frais d'Inscription, Réinscription & Cantine Scolaire</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] space-y-2">
                  <label className="block font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">
                    Frais Nouveaux Élèves :
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={1000}
                      value={formData.registrationFeeNew}
                      onChange={(e) => setFormData({ ...formData, registrationFeeNew: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-[#64748B] font-bold">FCFA</span>
                  </div>
                  <p className="text-[10px] text-[#64748B]">Facturé une seule fois à la première inscription.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] space-y-2">
                  <label className="block font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">
                    Réinscription Anciens Élèves :
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={1000}
                      value={formData.registrationFeeOld}
                      onChange={(e) => setFormData({ ...formData, registrationFeeOld: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-[#64748B] font-bold">FCFA</span>
                  </div>
                  <p className="text-[10px] text-[#64748B]">Droit annuel de réinscription pour les anciens.</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] space-y-2">
                  <label className="block font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">
                    Cantine Mensuelle :
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={1000}
                      value={formData.canteenMonthlyFee}
                      onChange={(e) => setFormData({ ...formData, canteenMonthlyFee: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-[#64748B] font-bold">FCFA/mois</span>
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-between">
                    <span>Total annuel cantine :</span>
                    <span className="font-mono">{formatFCFA(formData.canteenMonthlyFee * formData.schoolDurationMonths)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STRUCTURE PÉDAGOGIQUE (CYCLES ➔ CLASSES ➔ MATIÈRES)                */}
        {/* ========================================================================= */}
        {activeTab === 'structure' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* STEP 1: CYCLES SCOLAIRES */}
            <div className="p-6 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-[#222F46] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0071E3] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      Sélectionnez un Cycle d'Enseignement
                    </h3>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Choisissez le cycle pour afficher et gérer ses classes correspondantes.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#38BDF8]">
                  Cycle actif : {selectedCycle}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {CYCLES.map((c) => {
                  const isSelected = selectedCycle === c.id;
                  const classesInCycle = (formData.classes || []).filter((cls) => cls.cycle === c.id);
                  const cyclePrices = classesInCycle.map(cls => cls.monthlyTuition || c.defaultMonthly);
                  const minPrice = cyclePrices.length > 0 ? Math.min(...cyclePrices) : c.defaultMonthly;
                  const maxPrice = cyclePrices.length > 0 ? Math.max(...cyclePrices) : c.defaultMonthly;

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleCycleSelect(c.id)}
                      className={`cursor-pointer p-4 rounded-3xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white dark:bg-[#151D2E] border-[#0071E3] dark:border-[#38BDF8] ring-2 ring-[#0071E3]/20 shadow-md scale-[1.02]'
                          : 'bg-white dark:bg-[#151D2E] border-slate-200/80 dark:border-[#222F46] hover:border-slate-300 dark:hover:border-slate-700 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{c.icon}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.color}`}>
                            {classesInCycle.length} classe{classesInCycle.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] mt-1">{c.id}</h4>
                        <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{c.desc}</p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-[#222F46] flex items-center justify-between text-[10px]">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">Mensualités :</span>
                        <span className="font-mono font-bold text-[#0071E3] dark:text-[#38BDF8]">
                          {minPrice === maxPrice ? `${formatFCFA(minPrice)}/m` : `${minPrice / 1000}k - ${maxPrice / 1000}k/m`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: CLASSES DU CYCLE SELECTIONNÉ */}
            <div className="p-6 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-[#222F46] pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#0071E3] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                      <School className="w-4 h-4 text-[#0071E3]" />
                      <span>Classes du {selectedCycle} ({currentCycleClasses.length})</span>
                    </h3>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Cliquez sur une classe pour gérer ses matières et coefficients ci-dessous.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddClassOpen(!isAddClassOpen)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold transition-all shadow-xs shrink-0 hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une Classe en {selectedCycle}</span>
                </button>
              </div>

              {/* Add Class Inline Form */}
              {isAddClassOpen && (
                <div className="p-4 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-[#0071E3]/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#0071E3]" />
                      <span>Nouvelle Classe pour le Cycle {selectedCycle}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddClassOpen(false)}
                      className="text-xs text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                    >
                      Annuler
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[#64748B] dark:text-[#94A3B8] mb-1 font-medium text-[11px]">Nom de la classe :</label>
                      <input
                        type="text"
                        placeholder="Ex: 5ème B, CP1, Tle C"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#64748B] dark:text-[#94A3B8] mb-1 font-medium text-[11px]">Mensualité (1 mois) :</label>
                      <div className="relative">
                        <input
                          type="number"
                          step={1000}
                          value={newClassMonthlyTuition}
                          onChange={(e) => setNewClassMonthlyTuition(Number(e.target.value))}
                          className="w-full p-2 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs font-mono font-bold text-[#0071E3] dark:text-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                        />
                        <span className="absolute right-2.5 top-2 text-[10px] text-[#64748B] font-bold">FCFA</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#64748B] dark:text-[#94A3B8] mb-1 font-medium text-[11px]">Enseignant Titulaire :</label>
                      <input
                        type="text"
                        placeholder="Ex: M. Aimé Loubaki"
                        value={newClassTeacher}
                        onChange={(e) => setNewClassTeacher(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#64748B] dark:text-[#94A3B8] mb-1 font-medium text-[11px]">Salle & Capacité :</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Salle P01"
                          value={newClassRoom}
                          onChange={(e) => setNewClassRoom(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                        />
                        <input
                          type="number"
                          placeholder="30"
                          value={newClassCapacity}
                          onChange={(e) => setNewClassCapacity(Number(e.target.value))}
                          className="w-16 p-2 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs font-mono text-center text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                        />
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddClass}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs rounded-xl shadow-xs transition-all hover:scale-[1.01]"
                      >
                        <Check className="w-4 h-4" />
                        <span>Créer la Classe</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Classes Pills / Cards in current cycle */}
              {currentCycleClasses.length === 0 ? (
                <div className="p-8 text-center bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-dashed border-slate-200/80 dark:border-[#222F46] space-y-2">
                  <School className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Aucune classe configurée pour le cycle {selectedCycle}.</p>
                  <p className="text-[#64748B] dark:text-[#94A3B8] text-[11px]">
                    Cliquez sur "Ajouter une Classe en {selectedCycle}" ci-dessus pour en créer une.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {currentCycleClasses.map((cls) => {
                    const isSelected = selectedClassName === cls.name;
                    const subsCount = (formData.classSubjects?.[cls.name] || []).length;
                    const monthly = cls.monthlyTuition || 18000;
                    const annual = monthly * formData.schoolDurationMonths;

                    return (
                      <div
                        key={cls.id || cls.name}
                        onClick={() => setSelectedClassName(cls.name)}
                        className={`cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-[#0071E3] dark:border-[#38BDF8] ring-2 ring-[#0071E3]/30 shadow-xs'
                            : 'bg-[#F8FAFC] dark:bg-[#0F172A] border-slate-200/80 dark:border-[#222F46] hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                              {cls.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] text-[10px] font-semibold text-[#0071E3] dark:text-[#38BDF8]">
                              {subsCount} matière{subsCount > 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                            👤 {cls.mainTeacher || 'Non assigné'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            🚪 Salle : {cls.roomNumber || 'P01'} • Max {cls.maxCapacity || 30}
                          </p>
                        </div>

                        {/* Tuition on class card */}
                        <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-[#222F46] space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-[#64748B]">Mensualité :</span>
                            <span className="font-mono font-bold text-[#0071E3] dark:text-[#38BDF8]">
                              {formatFCFA(monthly)}/m
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-[#64748B]">Total ({formData.schoolDurationMonths}m) :</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {formatFCFA(annual)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-[#222F46] flex items-center justify-between">
                          <span className={`text-[10px] font-semibold ${isSelected ? 'text-[#0071E3] dark:text-[#38BDF8]' : 'text-slate-400'}`}>
                            {isSelected ? '✓ Sélectionnée' : 'Cliquer pour matières'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClass(cls.id, cls.name);
                            }}
                            className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Supprimer la classe"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* STEP 3: MATIÈRES DE LA CLASSE ACTIVE */}
            {selectedClassName && (
              <div className="p-6 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-[#222F46] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0071E3] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#0071E3]" />
                        <span>Matières & Coefficients : Classe {selectedClassName}</span>
                      </h3>
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        Total des coefficients : <strong className="text-[#0071E3] font-mono">{activeClassTotalCoeff}</strong> ({activeClassSubjects.length} matières enseignées)
                      </p>
                    </div>
                  </div>

                  {/* Actions Tools */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleImportStandardCurriculum}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
                      title="Réinitialiser avec le programme officiel congolais"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Programme Standard {selectedCycle}</span>
                    </button>

                    {/* Duplicate dropdown */}
                    {formData.classes && formData.classes.filter((c) => c.name !== selectedClassName && (formData.classSubjects?.[c.name] || []).length > 0).length > 0 && (
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0F172A] rounded-xl p-1">
                        <Copy className="w-3.5 h-3.5 text-[#64748B] ml-1.5" />
                        <select
                          value={duplicateSourceClass}
                          onChange={(e) => {
                            setDuplicateSourceClass(e.target.value);
                            handleDuplicateFromClass(e.target.value);
                          }}
                          className="bg-transparent text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none pr-2 py-0.5"
                        >
                          <option value="">Dupliquer depuis...</option>
                          {formData.classes
                            .filter((c) => c.name !== selectedClassName && (formData.classSubjects?.[c.name] || []).length > 0)
                            .map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name} ({(formData.classSubjects?.[c.name] || []).length} mat.)
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Subject Inline Bar */}
                <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#222F46] space-y-2">
                  <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                    Ajouter une matière à {selectedClassName}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Intitulé de la matière (ex: Informatique)"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                      />
                    </div>

                    <div>
                      <select
                        value={newSubCategory}
                        onChange={(e) => setNewSubCategory(e.target.value as any)}
                        className="w-full p-2 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                      >
                        <option value="Scientifique">Scientifique</option>
                        <option value="Littéraire">Littéraire</option>
                        <option value="Sport & Arts">Sport & Arts</option>
                        <option value="Vie Scolaire">Vie Scolaire</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl px-2 py-1">
                        <span className="text-[10px] text-[#64748B] font-bold">Coeff :</span>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={newSubCoeff}
                          onChange={(e) => setNewSubCoeff(Number(e.target.value))}
                          className="w-full bg-transparent font-mono font-bold text-xs text-[#0071E3] dark:text-[#38BDF8] text-center focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={handleAddSubject}
                        className="w-full flex items-center justify-center gap-1 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs rounded-xl shadow-xs transition-all hover:scale-[1.01]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subjects Table */}
                {activeClassSubjects.length === 0 ? (
                  <div className="p-8 text-center bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-dashed border-slate-200/80 dark:border-[#222F46] space-y-2">
                    <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Aucune matière enregistrée pour {selectedClassName}.</p>
                    <p className="text-[#64748B] dark:text-[#94A3B8] text-[11px]">
                      Utilisez le bouton "Programme Standard {selectedCycle}" ou ajoutez des matières manuellement.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-[#222F46]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-[#222F46] text-[#64748B] dark:text-[#94A3B8]">
                          <th className="p-3 font-semibold">Matière</th>
                          <th className="p-3 font-semibold">Catégorie</th>
                          <th className="p-3 font-semibold text-center">Coefficient</th>
                          <th className="p-3 font-semibold">Enseignant par défaut</th>
                          <th className="p-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-[#222F46]">
                        {activeClassSubjects.map((sub) => {
                          const categoryColor =
                            sub.category === 'Scientifique'
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900'
                              : sub.category === 'Littéraire'
                              ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-900'
                              : sub.category === 'Sport & Arts'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';

                          return (
                            <tr key={sub.id} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-[#0F172A]/50 transition-colors">
                              <td className="p-3 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                                {sub.name}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${categoryColor}`}>
                                  {sub.category}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <div className="inline-flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-lg px-2 py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSubjectCoefficient(sub.id, sub.coefficient - 1)}
                                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold px-1"
                                  >
                                    -
                                  </button>
                                  <span className="font-mono font-bold text-[#0071E3] dark:text-[#38BDF8] min-w-[1.2rem] text-center">
                                    {sub.coefficient}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSubjectCoefficient(sub.id, sub.coefficient + 1)}
                                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold px-1"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-[#64748B] dark:text-[#94A3B8]">
                                {sub.defaultTeacher || activeClassObj?.mainTeacher || 'Non spécifié'}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubject(sub.id)}
                                  className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                  title="Supprimer la matière"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: INFORMATIONS GÉNÉRALES ÉCOLE & CONTACT                            */}
        {/* ========================================================================= */}
        {activeTab === 'general' && (
          <div className="p-6 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm space-y-5 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] border-b border-slate-200/80 dark:border-[#222F46] pb-3 flex items-center gap-2">
              <School className="w-4 h-4 text-[#0071E3]" />
              <span>Identité de l'Établissement & Coordonnées</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">Nom de l'Établissement :</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">Année Scolaire en cours :</label>
                <input
                  type="text"
                  value={formData.currentSchoolYear}
                  onChange={(e) => setFormData({ ...formData, currentSchoolYear: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl font-mono font-bold text-[#0071E3] dark:text-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">Téléphone Principal (Standard) :</label>
                <input
                  type="text"
                  value={formData.schoolPhone}
                  onChange={(e) => setFormData({ ...formData, schoolPhone: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
                />
              </div>

              <div>
                <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">Email Officiel :</label>
                <input
                  type="email"
                  value={formData.schoolEmail}
                  onChange={(e) => setFormData({ ...formData, schoolEmail: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">Adresse Physique :</label>
                <input
                  type="text"
                  value={formData.schoolAddress}
                  onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
                />
              </div>

              <div>
                <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">Durée Standard :</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.schoolDurationMonths}
                    onChange={(e) => setFormData({ ...formData, schoolDurationMonths: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
                    required
                  />
                  <span className="text-[#64748B] dark:text-[#94A3B8] shrink-0 font-medium">mois</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">Indicatif WhatsApp :</label>
                <input
                  type="text"
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl font-mono font-bold text-[#0071E3] dark:text-[#38BDF8] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
                  required
                />
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-1 block font-medium">+242 pour Congo-Brazzaville</span>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-[#222F46]">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs rounded-2xl shadow-md transition-all hover:scale-[1.02] active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Enregistrer Tous les Paramètres & Tarifs</span>
          </button>
        </div>
      </form>
    </div>
  );
};
