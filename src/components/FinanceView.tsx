import React, { useState } from 'react';
import { SchoolConfig, Student, StudentCycle } from '../types';
import { formatFCFA, getStatusBadge, calculateProrataTuition, getClassMonthlyTuition, getClassesForCycle } from '../utils/formatters';
import { 
  Calculator, 
  Search, 
  Plus, 
  Check, 
  Receipt,
  MessageCircle,
  Clock
} from 'lucide-react';

interface FinanceViewProps {
  config: SchoolConfig;
  students: Student[];
  onOpenPayment: (student: Student) => void;
  onOpenStudentDetail: (student: Student) => void;
  onOpenWhatsApp: (student: Student) => void;
  onAddNewStudent: (newStudent: Student) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  config,
  students,
  onOpenPayment,
  onOpenStudentDetail,
  onOpenWhatsApp,
  onAddNewStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Prorata Sandbox Calculator state (Pre-filled with Slide 5 CE2 on Nov 3 example)
  const [simCycle, setSimCycle] = useState<StudentCycle>('Primaire');
  const [simClass, setSimClass] = useState<string>('CE2');
  const [simFirstName, setSimFirstName] = useState<string>('Dieuveil');
  const [simLastName, setSimLastName] = useState<string>('Mabiala');
  const [simDate, setSimDate] = useState<string>('2026-11-03');
  const [simMonths, setSimMonths] = useState<number>(8);
  const [simIsNew, setSimIsNew] = useState<boolean>(true);
  const [simHasCanteen, setSimHasCanteen] = useState<boolean>(false);
  const [simParentName, setSimParentName] = useState<string>('M. Mabiala');
  const [simParentPhone, setSimParentPhone] = useState<string>('066223344');

  const availableClassesForCycle = getClassesForCycle(selectedCycle, config);
  const simClassesForCycle = getClassesForCycle(simCycle, config);

  const monthlyFee = getClassMonthlyTuition(simClass, config, simCycle);
  const annualFee = monthlyFee * config.schoolDurationMonths;

  const calculatedTuition = monthlyFee * simMonths;
  const regFee = simIsNew ? config.registrationFeeNew : config.registrationFeeOld;
  const canteenFee = simHasCanteen ? config.canteenMonthlyFee * simMonths : 0;
  const totalSimDue = calculatedTuition + regFee + canteenFee;

  const handleEnrollProrataStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      matricule: `ADL-2026-${Math.floor(100 + Math.random() * 900)}`,
      firstName: simFirstName,
      lastName: simLastName,
      cycle: simCycle,
      classLevel: simClass,
      isNewStudent: simIsNew,
      hasCanteen: simHasCanteen,
      enrollmentDate: simDate,
      monthsEnrolled: simMonths,
      annualTuitionFull: annualFee,
      effectiveTuition: calculatedTuition,
      registrationFee: regFee,
      canteenTotal: canteenFee,
      totalDue: totalSimDue,
      totalPaid: 0,
      balanceRemaining: totalSimDue,
      status: 'impaye',
      parentName: simParentName,
      parentPhone: simParentPhone,
      parentMeetingAttended: 0,
      parentMeetingTotal: 4,
      parentMeetingAbsences: 0,
      gpa: 13.0,
      classRank: 12,
      totalStudentsInClass: 30,
      conductScore: 18,
      disciplinePoints: 0,
      unexcusedAbsences: 0,
      tardinessCount: 0,
      academicRemarks: `Inscription au prorata (${simMonths} mois).`,
      payments: [],
    };

    onAddNewStudent(newStudent);
    alert(`Élève ${simFirstName} ${simLastName} enregistré avec succès au Prorata Temporis (${formatFCFA(totalSimDue)}) !`);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCycle = selectedCycle === 'all' || s.cycle === selectedCycle;
    const matchesClass = selectedClass === 'all' || s.classLevel.toLowerCase() === selectedClass.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    return matchesSearch && matchesCycle && matchesClass && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. CALCULATEUR OFFICIEL DU PRORATA TEMPORIS (Soft UI) */}
      <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Controls */}
          <div className="lg:w-7/12 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#38BDF8] flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                Moteur Automatique de Prorata Temporis
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Ajustement Instantané pour Inscription en Cours d'Année
            </h3>

            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Pour toute admission après la rentrée de septembre, le montant de la scolarité est ajusté mathématiquement selon le nombre de mois effectifs de fréquentation sur les 10 mois scolaires.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[#64748B] dark:text-[#94A3B8] font-medium mb-1">Cycle d'études :</label>
                <select
                  value={simCycle}
                  onChange={(e) => {
                    const c = e.target.value as StudentCycle;
                    setSimCycle(c);
                    const classesInCycle = getClassesForCycle(c, config);
                    if (classesInCycle.length > 0) {
                      setSimClass(classesInCycle[0]);
                    }
                  }}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] text-[#0F172A] dark:text-[#F8FAFC] rounded-2xl p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                >
                  <option value="Préscolaire">Préscolaire</option>
                  <option value="Primaire">Primaire</option>
                  <option value="Collège">Collège</option>
                  <option value="Lycée">Lycée</option>
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] dark:text-[#94A3B8] font-medium mb-1">Classe liée :</label>
                <select
                  value={simClass}
                  onChange={(e) => setSimClass(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] text-[#0F172A] dark:text-[#F8FAFC] rounded-2xl p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                >
                  {simClassesForCycle.map((clsName) => {
                    const classObj = config.classes?.find((c) => c.name === clsName);
                    const mFee = classObj?.monthlyTuition || getClassMonthlyTuition(clsName, config, simCycle);
                    return (
                      <option key={clsName} value={clsName}>
                        {clsName} ({formatFCFA(mFee)}/mois)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] dark:text-[#94A3B8] font-medium mb-1">Date d'admission :</label>
                <input
                  type="date"
                  value={simDate}
                  onChange={(e) => setSimDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] text-[#0F172A] dark:text-[#F8FAFC] rounded-2xl p-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
              </div>
            </div>

            {/* Slider for months */}
            <div className="p-4 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#222F46] space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium">
                  Fréquentation effective : <strong className="font-mono text-[#0071E3] dark:text-[#38BDF8]">{simMonths} mois</strong> / {config.schoolDurationMonths} mois
                </span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  {simMonths === 8 ? 'Exemple CE2 au 3 novembre' : `${simMonths} mois restants`}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={simMonths}
                onChange={(e) => setSimMonths(Number(e.target.value))}
                className="w-full accent-[#0071E3] cursor-pointer"
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simIsNew}
                  onChange={(e) => setSimIsNew(e.target.checked)}
                  className="rounded-lg text-[#0071E3] accent-[#0071E3]"
                />
                <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium">
                  Nouvel élève (+{formatFCFA(config.registrationFeeNew)})
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simHasCanteen}
                  onChange={(e) => setSimHasCanteen(e.target.checked)}
                  className="rounded-lg text-[#0071E3] accent-[#0071E3]"
                />
                <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium">
                  Option Cantine (+{formatFCFA(config.canteenMonthlyFee)}/mois)
                </span>
              </label>
            </div>
          </div>

          {/* Right: Instant Calculation Breakdown */}
          <div className="lg:w-5/12 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                <span>Résultat Prorata Instantané</span>
                <span className="font-mono text-[#0F172A] dark:text-[#F8FAFC]">({annualFee.toLocaleString()} FCFA/an)</span>
              </div>

              <div className="p-4 bg-white dark:bg-[#151D2E] rounded-xl font-mono text-xs space-y-2 border border-slate-200/80 dark:border-[#222F46]">
                <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
                  <span>Formule :</span>
                  <span>{formatFCFA(monthlyFee)} × {simMonths} mois</span>
                </div>
                <div className="flex justify-between text-[#0F172A] dark:text-[#F8FAFC] font-semibold">
                  <span>Scolarité calculée :</span>
                  <span className="text-[#0071E3] dark:text-[#38BDF8]">{formatFCFA(calculatedTuition)}</span>
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Réf. totale annuelle : {formatFCFA(annualFee)} ({config.schoolDurationMonths} mois)
                </div>
                <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
                  <span>Frais inscription ({simIsNew ? 'Nouveau' : 'Ancien'}) :</span>
                  <span>{formatFCFA(regFee)}</span>
                </div>
                {simHasCanteen && (
                  <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
                    <span>Cantine ({simMonths} mois × 20k) :</span>
                    <span>{formatFCFA(canteenFee)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2.5 border-t border-slate-200/80 dark:border-[#222F46] text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  <span>TOTAL FACTURÉ :</span>
                  <span className="text-[#0071E3] dark:text-[#38BDF8]">{formatFCFA(totalSimDue)}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>
                  Exemple CE2 au 3 novembre : <strong>144 000 FCFA</strong> de scolarité calculée automatiquement.
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={simFirstName}
                  onChange={(e) => setSimFirstName(e.target.value)}
                  className="bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] text-[#0F172A] dark:text-[#F8FAFC] rounded-xl p-2.5"
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={simLastName}
                  onChange={(e) => setSimLastName(e.target.value)}
                  className="bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] text-[#0F172A] dark:text-[#F8FAFC] rounded-xl p-2.5"
                />
              </div>

              <button
                onClick={handleEnrollProrataStudent}
                className="w-full py-2.5 px-4 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Créer le dossier ({formatFCFA(totalSimDue)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECOVERY & CASH TABLE */}
      <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-[#222F46] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher élève, parent, matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200/80 dark:border-[#222F46] rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedCycle}
              onChange={(e) => {
                setSelectedCycle(e.target.value);
                setSelectedClass('all');
              }}
              className="border border-slate-200/80 dark:border-[#222F46] rounded-2xl px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#0F172A]"
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
              className="border border-slate-200/80 dark:border-[#222F46] rounded-2xl px-3 py-2 font-medium text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#0F172A]"
            >
              <option value="all">
                {selectedCycle === 'all' ? 'Toutes les classes' : `Toutes (${selectedCycle})`}
              </option>
              {availableClassesForCycle.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-200/80 dark:border-[#222F46] rounded-2xl px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#0F172A]"
            >
              <option value="all">Tous les statuts</option>
              <option value="solde">Soldé</option>
              <option value="partiel">Partiel</option>
              <option value="impaye">Impayé</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] font-medium border-b border-slate-200/80 dark:border-[#222F46]">
              <tr>
                <th className="py-3 px-4">Élève / Matricule</th>
                <th className="py-3 px-4">Cycle & Classe</th>
                <th className="py-3 px-4">Durée</th>
                <th className="py-3 px-4 font-mono text-right">Total Dû</th>
                <th className="py-3 px-4 font-mono text-right">Payé</th>
                <th className="py-3 px-4 font-mono text-right">Reste Dû</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-[#222F46] text-[#0F172A] dark:text-[#F8FAFC]">
              {filteredStudents.map((s) => {
                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-[#1E293B]/40 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onOpenStudentDetail(s)}
                        className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#0071E3] text-left block"
                      >
                        {s.firstName} {s.lastName}
                      </button>
                      <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">{s.matricule}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{s.classLevel}</span>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">{s.cycle}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-medium">{s.monthsEnrolled} / 10 mois</span>
                      {s.monthsEnrolled < 10 && (
                        <span className="text-[10px] text-[#0071E3] dark:text-[#38BDF8] block font-medium">Prorata</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-right font-medium">
                      {formatFCFA(s.totalDue)}
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatFCFA(s.totalPaid)}
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-rose-600 dark:text-rose-400 font-semibold">
                      {formatFCFA(s.balanceRemaining)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        s.status === 'solde' 
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                          : s.status === 'partiel'
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#38BDF8]'
                          : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                      }`}>
                        {s.status === 'solde' ? 'Soldé' : s.status === 'partiel' ? 'Partiel' : 'Impayé'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenPayment(s)}
                          className="px-3 py-1.5 rounded-xl bg-[#0F172A] dark:bg-[#2563EB] hover:bg-black dark:hover:bg-blue-600 text-white font-medium text-[11px] shadow-2xs"
                        >
                          Encaisser
                        </button>
                        {s.balanceRemaining > 0 && (
                          <button
                            onClick={() => onOpenWhatsApp(s)}
                            className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#38BDF8] hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            title="CRM WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
