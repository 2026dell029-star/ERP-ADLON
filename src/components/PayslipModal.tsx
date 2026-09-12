import React, { useState } from 'react';
import { StaffMember, SchoolConfig, TimetableSlot } from '../types';
import { formatFCFA } from '../utils/formatters';
import {
  getTeacherWeeklyHours,
  getTeacherMonthlyHours,
  calculateTeacherMonthlySalaryFromTimetable,
  calculateSlotDurationHours,
} from '../utils/timetableUtils';
import { printPayslip, openPayslipInNewTab } from '../utils/payrollPayslipPrinter';
import { 
  X, 
  Printer, 
  ExternalLink, 
  Download, 
  FileText, 
  Clock, 
  Calendar, 
  Plus, 
  Minus, 
  GraduationCap, 
  CheckCircle2, 
  Building2,
  DollarSign
} from 'lucide-react';

interface PayslipModalProps {
  staff: StaffMember;
  config: SchoolConfig;
  slots: TimetableSlot[];
  onClose: () => void;
}

const MONTH_OPTIONS = [
  'Septembre 2026',
  'Octobre 2026',
  'Novembre 2026',
  'Décembre 2026',
  'Janvier 2027',
  'Février 2027',
  'Mars 2027',
  'Avril 2027',
  'Mai 2027',
  'Juin 2027',
];

export const PayslipModal: React.FC<PayslipModalProps> = ({
  staff,
  config,
  slots,
  onClose,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('Septembre 2026');
  const [bonus, setBonus] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Timetable calculations using dedicated utility functions
  const teacherSlots = slots.filter((s) => s.teacherId === staff.id);
  const weeklyHours = getTeacherWeeklyHours(staff.id, slots);
  const monthlyHours = getTeacherMonthlyHours(staff.id, slots);
  const isHourly = staff.payType === 'hourly';
  const rate = staff.hourlyRate || 2500;

  const baseSalaryCalculated = calculateTeacherMonthlySalaryFromTimetable(staff, slots);

  const grossTotal = baseSalaryCalculated + Number(bonus || 0);
  const netPayable = Math.max(0, grossTotal - Number(deductions || 0));

  const payslipData = {
    staff,
    config,
    slots,
    monthYear: selectedMonth,
    bonus: Number(bonus || 0),
    deductions: Number(deductions || 0),
    notes,
  };

  const handlePrint = () => {
    printPayslip(payslipData);
  };

  const handleOpenNewTab = () => {
    openPayslipInNewTab(payslipData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-[#222F46] flex items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0071E3] dark:text-[#38BDF8]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                <span>Fiche de Paie & Bulletin Officiel</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-[#0071E3] dark:text-[#38BDF8]">
                  PDF & Impression
                </span>
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Salarié : <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{staff.name}</strong> • {staff.role} ({isHourly ? 'Prestataire horaire' : 'Fixe'})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                Période de Paie :
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 bg-white dark:bg-[#151D2E] border border-slate-200 dark:border-[#222F46] rounded-xl text-xs font-bold text-[#0071E3] dark:text-[#38BDF8] focus:ring-2 focus:ring-[#0071E3]"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                Prime / Bonification (FCFA) :
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
                placeholder="0"
                className="w-full p-2 bg-white dark:bg-[#151D2E] border border-slate-200 dark:border-[#222F46] rounded-xl text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                Retenues / Avance (FCFA) :
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={deductions}
                onChange={(e) => setDeductions(Number(e.target.value))}
                placeholder="0"
                className="w-full p-2 bg-white dark:bg-[#151D2E] border border-slate-200 dark:border-[#222F46] rounded-xl text-xs font-mono font-bold text-rose-600 dark:text-rose-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-1">
                Observations (Facultatif) :
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ex: Heures supplémentaires ou prime d'assiduité"
                className="w-full p-2 bg-white dark:bg-[#151D2E] border border-slate-200 dark:border-[#222F46] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>
          </div>

          {/* Document Printable Live Preview */}
          <div className="bg-slate-100 dark:bg-[#0A0F1D] p-3 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-[#222F46]">
            <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-lg max-w-3xl mx-auto space-y-6 text-xs">
              {/* Header Preview */}
              <div className="flex justify-between items-start border-b-2 border-[#0071E3] pb-4">
                <div>
                  <h1 className="text-lg font-extrabold text-[#0071E3] uppercase tracking-tight">
                    {config.schoolName || 'Établissement Scolaire'}
                  </h1>
                  <p className="text-[10px] italic font-semibold text-slate-600">
                    {config.schoolMotto || 'Discipline - Travail - Succès'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {config.schoolAddress || ''} — {config.schoolCity || 'Brazzaville'}, {config.schoolCountry || 'Congo'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Tél : {config.schoolPhone || 'N/A'} • {config.ministerialApproval || 'Agrément MEPSA'}
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                    BULLETIN DE PAIE
                  </h2>
                  <div className="inline-block mt-1 px-3 py-1 bg-blue-50 text-[#0071E3] border border-blue-200 rounded-lg font-bold text-xs">
                    Période : {selectedMonth}
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">
                    Émis le : {new Date().toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h3 className="font-bold text-[10px] uppercase text-slate-500 border-b border-slate-200 pb-1 mb-1">
                    Salarié / Enseignant
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nom & Prénom :</span>
                    <strong className="text-slate-900">{staff.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fonction :</span>
                    <strong className="text-slate-800">{staff.role}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type Contrat :</span>
                    <span className="font-semibold">{staff.contractType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rémunération :</span>
                    <strong className={isHourly ? 'text-amber-600' : 'text-blue-600'}>
                      {isHourly ? 'Prestataire Horaire' : 'Forfait Mensuel Fixe'}
                    </strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <h3 className="font-bold text-[10px] uppercase text-slate-500 border-b border-slate-200 pb-1 mb-1">
                    Volume Horaire (EDT)
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Créneaux placés :</span>
                    <strong className="text-slate-900">{teacherSlots.length} cours</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Volume Hebdo :</span>
                    <strong className="text-[#0071E3] text-xs">{weeklyHours}h / semaine</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cumul Mensuel :</span>
                    <strong className="text-slate-900">{monthlyHours}h / mois</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Taux Horaire :</span>
                    <strong className="font-mono">{isHourly ? `${formatFCFA(rate)} / h` : 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* Timetable slots table preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5 font-bold text-xs text-slate-800">
                  <span>Détail des Cours Dispensés (Emploi du temps)</span>
                  <span className="text-[10px] text-slate-500">{weeklyHours}h cumulées / sem</span>
                </div>
                {teacherSlots.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-center text-xs font-medium">
                    Aucun cours n'est actuellement consigné sur l'emploi du temps pour cet enseignant.
                  </div>
                ) : (
                  <table className="w-full border-collapse border border-slate-200 text-left text-[11px]">
                    <thead className="bg-slate-800 text-white font-semibold text-[10px]">
                      <tr>
                        <th className="p-1.5 border border-slate-300">Jour</th>
                        <th className="p-1.5 border border-slate-300 text-center">Horaires</th>
                        <th className="p-1.5 border border-slate-300 text-center">Durée</th>
                        <th className="p-1.5 border border-slate-300">Classe</th>
                        <th className="p-1.5 border border-slate-300">Matière</th>
                        <th className="p-1.5 border border-slate-300 text-center">Salle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherSlots.map((sl, idx) => {
                        const dur = calculateSlotDurationHours(sl.startTime, sl.endTime);
                        return (
                          <tr key={sl.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-1.5 border border-slate-200 font-bold">{sl.day}</td>
                            <td className="p-1.5 border border-slate-200 font-mono text-center">{sl.startTime} - {sl.endTime}</td>
                            <td className="p-1.5 border border-slate-200 text-center font-bold text-[#0071E3]">{dur}h</td>
                            <td className="p-1.5 border border-slate-200 font-semibold">{sl.className}</td>
                            <td className="p-1.5 border border-slate-200">{sl.subjectName}</td>
                            <td className="p-1.5 border border-slate-200 text-center text-slate-500">{sl.roomNumber || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Financial Calculation Table */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 mb-1.5">Décompte de la Rémunération</h4>
                <table className="w-full border-collapse border border-slate-200 text-left text-[11px]">
                  <thead className="bg-slate-800 text-white font-semibold text-[10px]">
                    <tr>
                      <th className="p-1.5 border border-slate-300">Élément de Paie</th>
                      <th className="p-1.5 border border-slate-300 text-center">Base</th>
                      <th className="p-1.5 border border-slate-300 text-center">Taux</th>
                      <th className="p-1.5 border border-slate-300 text-right">Montant Brut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1.5 border border-slate-200 font-bold">
                        {isHourly ? `Heures d'enseignement (${weeklyHours}h/sem)` : 'Salaire de Base Fixe'}
                      </td>
                      <td className="p-1.5 border border-slate-200 text-center font-mono">
                        {isHourly ? `${monthlyHours} hrs` : '1 mois'}
                      </td>
                      <td className="p-1.5 border border-slate-200 text-center font-mono">
                        {isHourly ? formatFCFA(rate) : '—'}
                      </td>
                      <td className="p-1.5 border border-slate-200 text-right font-mono font-bold">
                        {formatFCFA(baseSalaryCalculated)}
                      </td>
                    </tr>
                    {bonus > 0 && (
                      <tr>
                        <td className="p-1.5 border border-slate-200 text-emerald-700 font-semibold">Prime / Bonification</td>
                        <td className="p-1.5 border border-slate-200 text-center">1</td>
                        <td className="p-1.5 border border-slate-200 text-center font-mono">{formatFCFA(bonus)}</td>
                        <td className="p-1.5 border border-slate-200 text-right font-mono font-bold text-emerald-700">+ {formatFCFA(bonus)}</td>
                      </tr>
                    )}
                    {deductions > 0 && (
                      <tr>
                        <td className="p-1.5 border border-slate-200 text-rose-700 font-semibold">Retenues / Avance</td>
                        <td className="p-1.5 border border-slate-200 text-center">1</td>
                        <td className="p-1.5 border border-slate-200 text-center font-mono">{formatFCFA(deductions)}</td>
                        <td className="p-1.5 border border-slate-200 text-right font-mono font-bold text-rose-700">- {formatFCFA(deductions)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* NET BOX PREVIEW */}
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-xs text-emerald-900 uppercase">NET À PAYER AU SALARIÉ</div>
                  <div className="text-[10px] text-emerald-700 font-medium">Créances salariales en FCFA</div>
                </div>
                <div className="font-mono font-black text-2xl text-emerald-700">
                  {formatFCFA(netPayable)}
                </div>
              </div>

              {/* Signatures preview */}
              <div className="flex justify-between pt-6 border-t border-slate-200 text-[10px] text-slate-500">
                <div className="text-center w-5/12">
                  <div className="font-bold text-slate-700">Signature du Salarié</div>
                  <div className="mt-8 font-semibold text-slate-900">{staff.name}</div>
                </div>
                <div className="text-center w-5/12">
                  <div className="font-bold text-slate-700">La Direction & Cachet</div>
                  <div className="mt-8 font-semibold text-slate-900">{config.directorName || 'La Direction'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-[#222F46] bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-200 dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Fermer
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200/80 dark:border-[#222F46] transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#0071E3]" />
              <span>Ouvrir Plein Écran</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Générer / Imprimer PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
