import React, { useState, useMemo } from 'react';
import { SchoolConfig, Student } from '../types';
import { formatFCFA, cleanPhoneNumber, getClassesForCycle } from '../utils/formatters';
import { 
  MessageCircle, 
  Search, 
  Users, 
  Award,
  AlertCircle
} from 'lucide-react';

interface CrmWhatsAppViewProps {
  config: SchoolConfig;
  students: Student[];
  onOpenWhatsApp: (student: Student, defaultType?: 'relance' | 'convocation' | 'felicitations') => void;
}

export const CrmWhatsAppView: React.FC<CrmWhatsAppViewProps> = ({
  config,
  students,
  onOpenWhatsApp,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'impayes' | 'convocations' | 'majors'>('impayes');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const availableClassesForCycle = useMemo(() => {
    return getClassesForCycle(selectedCycle, config);
  }, [selectedCycle, config]);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm);

    if (!matchesSearch) return false;

    const matchesCycle = selectedCycle === 'all' || s.cycle === selectedCycle;
    const matchesClass = selectedClass === 'all' || s.classLevel.toLowerCase() === selectedClass.toLowerCase();
    if (!matchesCycle || !matchesClass) return false;

    if (filterType === 'impayes') return s.balanceRemaining > 0;
    if (filterType === 'convocations') return s.parentMeetingAbsences >= config.parentAbsenceAlertThreshold;
    if (filterType === 'majors') return s.classRank <= 3;
    return true;
  });

  const totalUnpaidCount = students.filter((s) => s.balanceRemaining > 0).length;
  const totalConvocationsCount = students.filter((s) => s.parentMeetingAbsences >= config.parentAbsenceAlertThreshold).length;
  const totalMajorsCount = students.filter((s) => s.classRank <= 3).length;

  return (
    <div className="space-y-6">
      {/* CRM WhatsApp Info Card */}
      <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-[#0071E3] dark:text-[#38BDF8] uppercase tracking-wider">
            CRM WhatsApp
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Relances, Convocations et Félicitations Directes
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Envoi instantané de messages personnalisés aux parents d'élèves via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] text-center min-w-[90px]">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block">À relancer</span>
            <strong className="text-lg font-mono font-bold text-rose-600 dark:text-rose-400">{totalUnpaidCount}</strong>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] text-center min-w-[90px]">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block">Convocations</span>
            <strong className="text-lg font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">{totalConvocationsCount}</strong>
          </div>
        </div>
      </div>

      {/* Segmented Control & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#151D2E] p-3 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm">
        <div className="flex items-center bg-[#F1F5F9] dark:bg-[#0F172A] p-1 rounded-2xl text-xs font-medium text-[#64748B] dark:text-[#94A3B8] overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setFilterType('impayes')}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-medium whitespace-nowrap shrink-0 ${
              filterType === 'impayes'
                ? 'bg-white dark:bg-[#1E293B] text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                : 'hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Top Impayés ({totalUnpaidCount})
          </button>

          <button
            onClick={() => setFilterType('convocations')}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-medium whitespace-nowrap shrink-0 ${
              filterType === 'convocations'
                ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-bold shadow-xs'
                : 'hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Convocations ({totalConvocationsCount})
          </button>

          <button
            onClick={() => setFilterType('majors')}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-medium whitespace-nowrap shrink-0 ${
              filterType === 'majors'
                ? 'bg-white dark:bg-[#1E293B] text-[#0071E3] dark:text-[#38BDF8] font-bold shadow-xs'
                : 'hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Félicitations ({totalMajorsCount})
          </button>

          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-medium whitespace-nowrap shrink-0 ${
              filterType === 'all'
                ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-bold shadow-xs'
                : 'hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Tous ({students.length})
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
            <option value="all">Tous cycles</option>
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
              {selectedCycle === 'all' ? 'Toutes classes' : `Toutes (${selectedCycle})`}
            </option>
            {availableClassesForCycle.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrer par nom, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs border border-slate-200/80 dark:border-[#222F46] rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3] w-full sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((s) => {
          const normalizedPhone = cleanPhoneNumber(s.parentPhone, config.countryCode);
          const isOverAbsenceThreshold = s.parentMeetingAbsences >= config.parentAbsenceAlertThreshold;
          
          return (
            <div key={s.id} className="p-5 rounded-3xl border border-slate-200/80 dark:border-[#222F46] bg-white dark:bg-[#151D2E] shadow-sm flex flex-col justify-between space-y-3.5 hover:border-slate-300 dark:hover:border-[#26334D] transition-all">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">{s.firstName} {s.lastName}</h4>
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">{s.cycle} • {s.classLevel}</span>
                  </div>
                  {s.balanceRemaining > 0 ? (
                    <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2.5 py-0.5 rounded-full">
                      -{formatFCFA(s.balanceRemaining)}
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full">
                      Soldé
                    </span>
                  )}
                </div>

                <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl text-xs space-y-1.5 border border-slate-200/60 dark:border-[#222F46]/60">
                  <div className="flex justify-between">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Parent :</span>
                    <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{s.parentName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Téléphone (+242) :</span>
                    <span className="font-mono text-[#0071E3] dark:text-[#38BDF8] font-semibold">+{normalizedPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Moyenne :</span>
                    <strong className="font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                      {s.gpa}/20 (Rang : {s.classRank === 1 ? '1er' : `${s.classRank}ème`} / {s.totalStudentsInClass || 1})
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Absences réunions :</span>
                    <strong className={`font-mono ${isOverAbsenceThreshold ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-[#0F172A] dark:text-[#F8FAFC]'}`}>
                      {s.parentMeetingAbsences} / {s.parentMeetingTotal}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2.5 border-t border-slate-200/80 dark:border-[#222F46] flex items-center justify-between gap-2">
                {s.balanceRemaining > 0 && (
                  <button
                    onClick={() => onOpenWhatsApp(s, 'relance')}
                    className="flex-1 py-2 px-3 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Relancer Dû</span>
                  </button>
                )}

                {isOverAbsenceThreshold && (
                  <button
                    onClick={() => onOpenWhatsApp(s, 'convocation')}
                    className="flex-1 py-2 px-3 rounded-2xl bg-[#0F172A] dark:bg-[#2563EB] hover:bg-black dark:hover:bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Convoquer</span>
                  </button>
                )}

                {s.classRank <= 3 && s.balanceRemaining === 0 && (
                  <button
                    onClick={() => onOpenWhatsApp(s, 'felicitations')}
                    className="flex-1 py-2 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Féliciter</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
