import React, { useState, useMemo } from 'react';
import { Student, SubjectGrade, SchoolConfig } from '../types';
import { 
  TERMS, 
  AcademicTerm, 
  calculateWeightedAverage, 
  getDefaultSubjectsForClass,
  getCouncilMention,
  generateWhatsAppReportText,
  getStudentGradesForTerm,
  computeSubjectScore,
  computeStudentReport
} from '../utils/gradeCalculations';
import { cleanPhoneNumber, getClassesForCycle } from '../utils/formatters';
import { 
  Award, 
  BookOpen, 
  Search, 
  Save, 
  CheckCircle2, 
  Plus, 
  Share2, 
  FileText, 
  Sparkles,
  Trophy,
  Filter,
  Info,
  Edit3
} from 'lucide-react';
import { ReportCardModal } from './ReportCardModal';

interface GradesViewProps {
  students: Student[];
  onUpdateStudents: (updatedStudents: Student[]) => void;
  onOpenWhatsApp?: (student: Student, type?: 'relance' | 'convocation' | 'felicitations') => void;
  config?: SchoolConfig;
}

type ViewMode = 'entry' | 'ranking' | 'batch_reports';

export const GradesView: React.FC<GradesViewProps> = ({
  students,
  onUpdateStudents,
  onOpenWhatsApp,
  config,
}) => {
  // State filters
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm>('Trimestre 1');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('entry');
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Active Report Card Modal
  const [activeReportStudent, setActiveReportStudent] = useState<Student | null>(null);

  // Active Student for Devoir/Composition modal editing
  const [editingStudentGrades, setEditingStudentGrades] = useState<Student | null>(null);

  // Local working copy of student grades
  // Format: Record<studentId, SubjectGrade[]>
  const [localGrades, setLocalGrades] = useState<Record<string, SubjectGrade[]>>(() => {
    const map: Record<string, SubjectGrade[]> = {};
    students.forEach((s) => {
      map[s.id] = getStudentGradesForTerm(s, 'Trimestre 1', config);
    });
    return map;
  });

  // Re-sync localGrades when selectedTerm changes
  const handleTermChange = (term: AcademicTerm) => {
    setSelectedTerm(term);
    const map: Record<string, SubjectGrade[]> = {};
    students.forEach((s) => {
      map[s.id] = getStudentGradesForTerm(s, term, config);
    });
    setLocalGrades(map);
  };

  // Distinct classes available for selected cycle
  const availableClasses = useMemo(() => {
    return getClassesForCycle(selectedCycle, config);
  }, [selectedCycle, config]);

  // Filter students by selected cycle, class and search
  const classStudents = useMemo(() => {
    return students.filter((s) => {
      const matchCycle = selectedCycle === 'all' || s.cycle === selectedCycle;
      const matchClass = selectedClass === 'all' || s.classLevel.toLowerCase() === selectedClass.toLowerCase();
      const matchSearch =
        s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.matricule.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCycle && matchClass && matchSearch;
    });
  }, [students, selectedCycle, selectedClass, searchQuery]);

  // Compute live averages and ranks for students currently loaded
  const studentReports = useMemo(() => {
    return classStudents.map((s) => {
      const currentGrades = localGrades[s.id] || getStudentGradesForTerm(s, selectedTerm, config);
      const { average, totalPoints, totalCoeff } = calculateWeightedAverage(currentGrades);
      return {
        student: s,
        grades: currentGrades,
        average,
        totalPoints,
        totalCoeff,
      };
    });
  }, [classStudents, localGrades, selectedTerm, config]);

  // Sort by average to determine live ranks
  const rankedReports = useMemo(() => {
    const list = [...studentReports];
    list.sort((a, b) => b.average - a.average);
    return list.map((item, index) => ({
      ...item,
      liveRank: index + 1,
    }));
  }, [studentReports]);

  // Lookup map for fast live rank lookup by studentId
  const liveRankMap = useMemo(() => {
    const map = new Map<string, { rank: number; average: number; totalPoints: number; totalCoeff: number }>();
    rankedReports.forEach((item) => {
      map.set(item.student.id, {
        rank: item.liveRank,
        average: item.average,
        totalPoints: item.totalPoints,
        totalCoeff: item.totalCoeff,
      });
    });
    return map;
  }, [rankedReports]);

  // Overall Class Statistics
  const classStats = useMemo(() => {
    if (studentReports.length === 0) {
      return { avg: 0, high: 0, low: 0, passRate: 0, honorsCount: 0 };
    }
    const avgs = studentReports.map((r) => r.average);
    const sum = avgs.reduce((a, b) => a + b, 0);
    const avg = Number((sum / avgs.length).toFixed(2));
    const high = Math.max(...avgs);
    const low = Math.min(...avgs);
    const passing = avgs.filter((a) => a >= 10).length;
    const passRate = Math.round((passing / avgs.length) * 100);
    const honorsCount = avgs.filter((a) => a >= 14).length;
    return { avg, high, low, passRate, honorsCount };
  }, [studentReports]);

  // Handle live Devoir or Composition change for an individual student and subject
  const handleScoreChange = (studentId: string, subjectIndex: number, field: 'homeworkScore' | 'compositionScore', val: string) => {
    const num = Number(val);
    if (isNaN(num) && val !== '') return;
    const bounded = Math.min(20, Math.max(0, isNaN(num) ? 0 : num));

    setLocalGrades((prev) => {
      const studentGrades = prev[studentId]
        ? [...prev[studentId]]
        : getDefaultSubjectsForClass(
            students.find((s) => s.id === studentId)?.classLevel || 'CE2',
            students.find((s) => s.id === studentId)?.cycle || 'Primaire',
            config
          );

      if (studentGrades[subjectIndex]) {
        const sub = { ...studentGrades[subjectIndex] };
        sub[field] = bounded;
        // Recalculate combined score: (Devoir + 2 * Composition) / 3
        sub.score = computeSubjectScore(sub.homeworkScore, sub.compositionScore, sub.score);
        studentGrades[subjectIndex] = sub;
      }

      return {
        ...prev,
        [studentId]: studentGrades,
      };
    });
  };

  // Save all modified grades permanently to App state & localStorage
  const handleSaveGrades = () => {
    const updatedStudents = students.map((s) => {
      const gradesForThisStudent = localGrades[s.id];
      if (!gradesForThisStudent) return s;

      const existingTermGrades = s.termGrades || {};
      const updatedTermGrades = {
        ...existingTermGrades,
        [selectedTerm]: gradesForThisStudent,
      };

      return {
        ...s,
        termGrades: updatedTermGrades,
      };
    });

    onUpdateStudents(updatedStudents);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const handleQuickWhatsAppBulletin = (student: Student) => {
    const report = computeStudentReport(student, students, selectedTerm);
    const text = generateWhatsAppReportText(report, student);
    
    if (onOpenWhatsApp) {
      onOpenWhatsApp(student, 'felicitations');
    } else {
      const cleanPhone = cleanPhoneNumber(student.parentPhone || '');
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      {/* Top Header & Term Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Gestion des Notes, Devoirs & Compositions
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Formule officielle : Moyenne = (Devoir + 2 × Composition) / 3 • Coefficients par matière
          </p>
        </div>

        {/* Term Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#222F46]">
          {TERMS.map((term) => (
            <button
              key={term}
              onClick={() => handleTermChange(term)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedTerm === term
                  ? 'bg-[#0071E3] text-white shadow-xs'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Cycle & Class Selector + Stats Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Cycle & Class Filter (2 cols) */}
        <div className="p-4 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm flex flex-col justify-between sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">Sélection Pédagogique</span>
            <Filter className="w-3.5 h-3.5 text-[#0071E3]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium mb-1">Cycle</label>
              <select
                value={selectedCycle}
                onChange={(e) => {
                  setSelectedCycle(e.target.value);
                  setSelectedClass('all');
                }}
                className="w-full p-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              >
                <option value="all">Tous cycles</option>
                <option value="Préscolaire">Préscolaire</option>
                <option value="Primaire">Primaire</option>
                <option value="Collège">Collège</option>
                <option value="Lycée">Lycée</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium mb-1">Classe liée</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              >
                <option value="all">
                  {selectedCycle === 'all' ? 'Toutes classes' : `Toutes (${selectedCycle})`}
                </option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-4 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">Moyenne de Classe</span>
            <strong className="text-lg font-mono font-extrabold text-[#0071E3] dark:text-[#38BDF8]">
              {classStats.avg} <span className="text-xs font-normal">/20</span>
            </strong>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#0071E3] dark:text-[#38BDF8]">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">Taux de Réussite</span>
            <strong className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              {classStats.passRate}%
            </strong>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">Meilleure Moyenne</span>
            <strong className="text-lg font-mono font-extrabold text-amber-600 dark:text-amber-400">
              {classStats.high} /20
            </strong>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">Tableau d'Honneur</span>
            <strong className="text-lg font-mono font-extrabold text-purple-600 dark:text-purple-400">
              {classStats.honorsCount} élèves
            </strong>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Toolbar & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Rechercher un élève..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-xs font-semibold text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
          />
        </div>

        {/* View mode switcher & Save button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          <div className="flex items-center bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setViewMode('entry')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'entry' ? 'bg-[#0071E3] text-white shadow-xs' : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              Saisie Notes
            </button>
            <button
              onClick={() => setViewMode('ranking')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'ranking' ? 'bg-[#0071E3] text-white shadow-xs' : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              Classement & Bulletins
            </button>
          </div>

          <button
            onClick={handleSaveGrades}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs rounded-2xl shadow-md transition-all hover:scale-[1.02] active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les Notes</span>
          </button>

          {isSavedToast && (
            <div className="flex items-center gap-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Notes enregistrées !</span>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: GRADES ENTRY (Devoir & Composition per Subject) */}
      {viewMode === 'entry' && (
        <div className="space-y-4">
          {classStudents.map((student) => {
            const currentGrades = localGrades[student.id] || getDefaultSubjectsForClass(student.classLevel, student.cycle, config);
            const rankInfo = liveRankMap.get(student.id) || { average: 12, rank: 1 };
            const mention = getCouncilMention(rankInfo.average);

            return (
              <div 
                key={student.id}
                className="p-5 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm space-y-4 transition-all hover:border-[#0071E3]/40"
              >
                {/* Student Info Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-[#222F46]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0071E3] dark:text-[#38BDF8] flex items-center justify-center font-bold text-xs font-mono">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-2">
                        <span>{student.firstName} {student.lastName}</span>
                        <span className="text-[11px] font-mono font-normal text-[#64748B]">({student.matricule})</span>
                      </h4>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        Classe : <strong className="text-slate-800 dark:text-slate-200">{student.classLevel}</strong> • Parent : {student.parentName || 'Non renseigné'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">Moyenne Trimestrielle</span>
                      <strong className="text-base font-mono font-extrabold text-[#0071E3] dark:text-[#38BDF8]">
                        {rankInfo.average} / 20
                      </strong>
                    </div>

                    <div className={`px-3 py-1 rounded-xl text-xs font-bold border ${mention.badgeColor}`}>
                      {mention.mention}
                    </div>

                    <button
                      onClick={() => setActiveReportStudent(student)}
                      className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0071E3] hover:bg-blue-100 transition-colors"
                      title="Voir le bulletin complet"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subject Grades Grid: Devoir + Composition */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentGrades.map((sub, sIdx) => (
                    <div 
                      key={sub.subjectId || sub.subjectName} 
                      className="p-3.5 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#222F46] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#0F172A] dark:text-white truncate max-w-[180px]" title={sub.subjectName}>
                          {sub.subjectName}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#0071E3] dark:text-[#38BDF8] text-[10px] font-mono font-bold">
                          Coeff {sub.coefficient}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 items-center">
                        {/* Devoir input */}
                        <div>
                          <label className="block text-[10px] text-[#64748B] dark:text-[#94A3B8] mb-1 font-medium">Devoir (/20)</label>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            step={0.5}
                            value={sub.homeworkScore ?? 12}
                            onChange={(e) => handleScoreChange(student.id, sIdx, 'homeworkScore', e.target.value)}
                            className="w-full p-2 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-center font-mono font-bold text-xs text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                          />
                        </div>

                        {/* Composition input */}
                        <div>
                          <label className="block text-[10px] text-[#64748B] dark:text-[#94A3B8] mb-1 font-medium">Compo (/20)</label>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            step={0.5}
                            value={sub.compositionScore ?? 12}
                            onChange={(e) => handleScoreChange(student.id, sIdx, 'compositionScore', e.target.value)}
                            className="w-full p-2 bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] rounded-xl text-center font-mono font-bold text-xs text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                          />
                        </div>

                        {/* Computed subject average */}
                        <div className="text-center bg-blue-50/60 dark:bg-blue-950/40 p-1.5 rounded-xl border border-blue-100 dark:border-blue-900/50">
                          <span className="block text-[9px] text-[#0071E3] dark:text-[#38BDF8] font-semibold">Moy. Matière</span>
                          <span className="font-mono font-extrabold text-xs text-[#0071E3] dark:text-[#38BDF8]">
                            {sub.score}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {classStudents.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46]">
              <p className="text-xs text-[#64748B]">Aucun élève trouvé pour cette recherche.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: RANKING & BULLETINS */}
      {viewMode === 'ranking' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rankedReports.map(({ student, average, liveRank }) => {
            const mention = getCouncilMention(average);
            return (
              <div
                key={student.id}
                className="p-5 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm flex flex-col justify-between hover:border-[#0071E3] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-sm font-bold text-[#0F172A] dark:text-white block">
                        {student.firstName} {student.lastName}
                      </strong>
                      <span className="text-[11px] font-mono text-[#64748B]">
                        {student.matricule} • {student.classLevel}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-200 dark:border-amber-800/40 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{liveRank === 1 ? '1er' : `${liveRank}ème`}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80 dark:border-[#222F46]">
                    <span className="text-[#64748B]">Moyenne Générale :</span>
                    <span className="font-mono font-extrabold text-sm text-[#0071E3] dark:text-[#38BDF8]">
                      {average} / 20
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Mention du Conseil :</span>
                    <span className={`font-semibold text-xs ${mention.textColor}`}>
                      {mention.mention}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-200/80 dark:border-[#222F46]">
                  <button
                    onClick={() => setActiveReportStudent(student)}
                    className="flex-1 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0071E3] hover:bg-blue-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Voir Bulletin</span>
                  </button>

                  <button
                    onClick={() => handleQuickWhatsAppBulletin(student)}
                    className="p-2 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors"
                    title="Envoyer le bulletin sur WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Card Modal */}
      {activeReportStudent && (
        <ReportCardModal
          student={activeReportStudent}
          allStudents={students}
          initialTerm={selectedTerm}
          onClose={() => setActiveReportStudent(null)}
          onSelectStudent={(st) => setActiveReportStudent(st)}
        />
      )}
    </div>
  );
};
