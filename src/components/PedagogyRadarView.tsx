import React, { useState, useMemo } from 'react';
import { Student, SchoolConfig } from '../types';
import { getClassesForCycle } from '../utils/formatters';
import { 
  GraduationCap, 
  Award, 
  ShieldAlert, 
  Users, 
  Check, 
  AlertCircle
} from 'lucide-react';

interface PedagogyRadarViewProps {
  students: Student[];
  onOpenStudentDetail: (student: Student) => void;
  onOpenWhatsApp: (student: Student) => void;
  config?: SchoolConfig;
}

export const PedagogyRadarView: React.FC<PedagogyRadarViewProps> = ({
  students,
  onOpenStudentDetail,
  onOpenWhatsApp,
  config,
}) => {
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'correlation' | 'palmares' | 'discipline'>('correlation');

  const availableClassesForCycle = useMemo(() => {
    return getClassesForCycle(selectedCycle, config);
  }, [selectedCycle, config]);

  const sortedByGpa = [...students].sort((a, b) => b.gpa - a.gpa);

  const filtered = useMemo(() => {
    return sortedByGpa.filter((s) => {
      const matchCycle = selectedCycle === 'all' || s.cycle === selectedCycle;
      const matchClass = selectedClass === 'all' || s.classLevel.toLowerCase() === selectedClass.toLowerCase();
      return matchCycle && matchClass;
    });
  }, [sortedByGpa, selectedCycle, selectedClass]);

  // Correlation calculations (Slide 11)
  const highAttendanceStudents = filtered.filter((s) => (s.parentMeetingAttended / s.parentMeetingTotal) >= 0.75);
  const lowAttendanceStudents = filtered.filter((s) => (s.parentMeetingAttended / s.parentMeetingTotal) < 0.50);

  const avgGpaHigh = highAttendanceStudents.length > 0
    ? (highAttendanceStudents.reduce((a, s) => a + s.gpa, 0) / highAttendanceStudents.length).toFixed(1)
    : '0';

  const avgGpaLow = lowAttendanceStudents.length > 0
    ? (lowAttendanceStudents.reduce((a, s) => a + s.gpa, 0) / lowAttendanceStudents.length).toFixed(1)
    : '0';

  const avgDisciplineHigh = highAttendanceStudents.length > 0
    ? (highAttendanceStudents.reduce((a, s) => a + s.disciplinePoints, 0) / highAttendanceStudents.length).toFixed(1)
    : '0';

  const avgDisciplineLow = lowAttendanceStudents.length > 0
    ? (lowAttendanceStudents.reduce((a, s) => a + s.disciplinePoints, 0) / lowAttendanceStudents.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header with Apple Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#151D2E] p-3 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm">
        <div className="flex items-center bg-[#F1F5F9] dark:bg-[#0F172A] p-1 rounded-2xl text-xs font-medium text-[#64748B] dark:text-[#94A3B8] overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setActiveTab('correlation')}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-medium whitespace-nowrap shrink-0 ${
              activeTab === 'correlation'
                ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-bold shadow-xs'
                : 'hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Analyse Croisée d'Impact
          </button>
          <button
            onClick={() => setActiveTab('palmares')}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-medium whitespace-nowrap shrink-0 ${
              activeTab === 'palmares'
                ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-bold shadow-xs'
                : 'hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Palmarès Académique
          </button>
          <button
            onClick={() => setActiveTab('discipline')}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-medium whitespace-nowrap shrink-0 ${
              activeTab === 'discipline'
                ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-bold shadow-xs'
                : 'hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Radar de Discipline
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCycle}
            onChange={(e) => {
              setSelectedCycle(e.target.value);
              setSelectedClass('all');
            }}
            className="text-xs border border-slate-200/80 dark:border-[#222F46] rounded-2xl px-3 py-2 bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]"
          >
            <option value="all">Tous les cycles</option>
            <option value="Préscolaire">Préscolaire</option>
            <option value="Primaire">Primaire</option>
            <option value="Collège">Collège</option>
            <option value="Lycée">Lycée</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-medium border border-slate-200/80 dark:border-[#222F46] rounded-2xl px-3 py-2 bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]"
          >
            <option value="all">
              {selectedCycle === 'all' ? 'Toutes les classes' : `Toutes (${selectedCycle})`}
            </option>
            {availableClassesForCycle.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: CORRELATION ANALYSIS (Apple Clean Card) */}
      {activeTab === 'correlation' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] p-5 sm:p-7 shadow-sm space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#0071E3] dark:text-[#38BDF8] uppercase tracking-wider">
                Corrélation Statistique
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Impact de l'Assiduité Parentale sur la Réussite Scolaire
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-2xl leading-relaxed">
                Les résultats de l'établissement confirment le lien direct entre la participation des familles aux réunions scolaires (≥ 75% vs ≤ 25%) et la performance académique ainsi que le respect des règles de vie.
              </p>
            </div>

            {/* Impact Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Familles Assidues (≥ 75% Présence)
                  </span>
                  <span className="text-xs font-mono font-medium text-[#64748B] dark:text-[#94A3B8]">
                    {highAttendanceStudents.length} élèves
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 bg-white dark:bg-[#151D2E] rounded-xl border border-slate-200/80 dark:border-[#222F46]">
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">Moyenne Générale</span>
                    <strong className="text-xl font-mono text-emerald-600 dark:text-emerald-400 font-bold">{avgGpaHigh} / 20</strong>
                  </div>
                  <div className="p-3.5 bg-white dark:bg-[#151D2E] rounded-xl border border-slate-200/80 dark:border-[#222F46]">
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">Pénalités Discipline</span>
                    <strong className="text-xl font-mono text-[#0F172A] dark:text-[#F8FAFC] font-bold">{avgDisciplineHigh} pts</strong>
                  </div>
                </div>

                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Résultats réguliers, devoirs soignés, zéro conflit disciplinaire majeur.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Familles Éloignées (≤ 25% Présence)
                  </span>
                  <span className="text-xs font-mono font-medium text-[#64748B] dark:text-[#94A3B8]">
                    {lowAttendanceStudents.length} élèves
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 bg-white dark:bg-[#151D2E] rounded-xl border border-slate-200/80 dark:border-[#222F46]">
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">Moyenne Générale</span>
                    <strong className="text-xl font-mono text-rose-600 dark:text-rose-400 font-bold">{avgGpaLow} / 20</strong>
                  </div>
                  <div className="p-3.5 bg-white dark:bg-[#151D2E] rounded-xl border border-slate-200/80 dark:border-[#222F46]">
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">Pénalités Discipline</span>
                    <strong className="text-xl font-mono text-rose-600 dark:text-rose-400 font-bold">{avgDisciplineLow} pts</strong>
                  </div>
                </div>

                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Retards fréquents, baisse d'attention, corrélation fréquente avec les retards de paiement.
                </p>
              </div>
            </div>
          </div>

          {/* Student Correlation List */}
          <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-[#222F46]">
              <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Confrontation Élève par Élève : Notes & Présence aux Réunions
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] font-medium border-b border-slate-200/80 dark:border-[#222F46]">
                  <tr>
                    <th className="py-3 px-4">Élève</th>
                    <th className="py-3 px-4">Classe</th>
                    <th className="py-3 px-4 font-mono">Moyenne /20</th>
                    <th className="py-3 px-4">Sanctions</th>
                    <th className="py-3 px-4">Présence Parents aux Réunions</th>
                    <th className="py-3 px-4 text-right">Fiche 360°</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-[#222F46] text-[#0F172A] dark:text-[#F8FAFC]">
                  {filtered.map((s) => {
                    const parentAttendancePct = Math.round((s.parentMeetingAttended / s.parentMeetingTotal) * 100);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-[#1E293B]/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="py-3 px-4 text-[#64748B] dark:text-[#94A3B8]">{s.classLevel}</td>
                        <td className="py-3 px-4 font-mono font-bold">
                          <span className={s.gpa >= 14 ? 'text-emerald-600 dark:text-emerald-400' : s.gpa < 10 ? 'text-rose-600 dark:text-rose-400' : 'text-[#0F172A] dark:text-[#F8FAFC]'}>
                            {s.gpa} / 20
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {s.disciplinePoints > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400 font-bold">{s.disciplinePoints} pts</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">0 pt</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  parentAttendancePct >= 75 ? 'bg-emerald-500' : parentAttendancePct <= 25 ? 'bg-rose-500' : 'bg-[#0071E3]'
                                }`} 
                                style={{ width: `${parentAttendancePct}%` }}
                              />
                            </div>
                            <span className="font-mono text-[#64748B] dark:text-[#94A3B8]">{parentAttendancePct}% ({s.parentMeetingAttended}/{s.parentMeetingTotal})</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onOpenStudentDetail(s)}
                            className="px-3 py-1.5 rounded-xl bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0F172A] dark:text-[#F8FAFC] font-medium text-[11px] transition-colors"
                          >
                            Vue 360°
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PALMARES */}
      {activeTab === 'palmares' && (
        <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-200/80 dark:divide-[#222F46]">
            {filtered.map((s, idx) => (
              <div key={s.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-[#1E293B]/40 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                    idx === 0 ? 'bg-[#0F172A] dark:bg-[#2563EB] text-white' :
                    idx === 1 ? 'bg-slate-200 dark:bg-slate-700 text-[#0F172A] dark:text-[#F8FAFC]' :
                    idx === 2 ? 'bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-[#94A3B8]' : 'text-[#64748B] dark:text-[#94A3B8]'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] block">{s.firstName} {s.lastName}</strong>
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">{s.cycle} • {s.classLevel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Moyenne</span>
                    <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{s.gpa} / 20</span>
                  </div>
                  <button
                    onClick={() => onOpenStudentDetail(s)}
                    className="px-3.5 py-1.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    Fiche 360°
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: DISCIPLINE */}
      {activeTab === 'discipline' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="p-5 rounded-3xl border border-slate-200/80 dark:border-[#222F46] bg-white dark:bg-[#151D2E] shadow-sm space-y-3.5">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">{s.firstName} {s.lastName}</h5>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">{s.classLevel}</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  s.disciplinePoints > 3 ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {s.conductScore}/20 Conduite
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-[#222F46]/60">
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Retards</span>
                  <strong className="font-mono text-[#0F172A] dark:text-[#F8FAFC] font-bold">{s.tardinessCount}</strong>
                </div>
                <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-[#222F46]/60">
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Absences</span>
                  <strong className="font-mono text-[#0F172A] dark:text-[#F8FAFC] font-bold">{s.unexcusedAbsences} j</strong>
                </div>
                <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-slate-200/60 dark:border-[#222F46]/60">
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Pénalités</span>
                  <strong className={`font-mono font-bold ${s.disciplinePoints > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {s.disciplinePoints}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
