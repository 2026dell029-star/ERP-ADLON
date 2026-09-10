import React from 'react';
import { Student } from '../types';
import { formatFCFA, cleanPhoneNumber } from '../utils/formatters';
import { 
  X, 
  MessageCircle, 
  Phone, 
  Check, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

interface StudentDetailModalProps {
  student: Student;
  countryCode: string;
  onClose: () => void;
  onOpenWhatsApp: (student: Student) => void;
  onOpenPayment: (student: Student) => void;
  onOpenBulletin?: (student: Student) => void;
  onOpenPenalty?: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  countryCode,
  onClose,
  onOpenWhatsApp,
  onOpenPayment,
  onOpenBulletin,
  onOpenPenalty,
}) => {
  const isOverAbsence = student.parentMeetingAbsences >= 2;
  const normalizedPhone = cleanPhoneNumber(student.parentPhone, countryCode);
  const activePenalties = (student.penalties || []).filter((p) => p.status === 'active');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white dark:bg-[#151D2E] rounded-3xl max-w-3xl w-full my-2 sm:my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] shadow-2xl border border-slate-200/80 dark:border-[#222F46] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Top Bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 dark:border-[#222F46] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F172A] dark:bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#0F172A] dark:text-[#F8FAFC]">{student.firstName} {student.lastName}</h3>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  student.status === 'solde'
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : student.status === 'partiel'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#38BDF8]'
                    : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                }`}>
                  {student.status === 'solde' ? 'Soldé' : student.status === 'partiel' ? 'Partiel' : 'Impayé'}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {student.cycle} • {student.classLevel} • Matricule {student.matricule}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-[#0F172A] dark:text-[#F8FAFC]">
          {/* Financial summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]">Situation Financière & Scolarité</span>
              {student.monthsEnrolled < 10 && (
                <span className="text-[11px] text-[#0071E3] dark:text-[#38BDF8] font-semibold bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full">
                  Prorata {student.monthsEnrolled} mois appliqué
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
              <div className="p-3 bg-white dark:bg-[#151D2E] rounded-xl border border-slate-200/80 dark:border-[#222F46]">
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Total Facturé</span>
                <strong className="text-sm font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">{formatFCFA(student.totalDue)}</strong>
              </div>
              <div className="p-3 bg-white dark:bg-[#151D2E] rounded-xl border border-slate-200/80 dark:border-[#222F46]">
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Déjà Réglé</span>
                <strong className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatFCFA(student.totalPaid)}</strong>
              </div>
              <div className="p-3 bg-white dark:bg-[#151D2E] rounded-xl border border-slate-200/80 dark:border-[#222F46]">
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Reste à Payer</span>
                <strong className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">{formatFCFA(student.balanceRemaining)}</strong>
              </div>
            </div>
          </div>

          {/* Academic & Conduct */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] space-y-2.5">
              <span className="font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC] block">Pédagogie</span>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-[#222F46]/60">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Moyenne générale :</span>
                <strong className="font-mono text-[#0F172A] dark:text-[#F8FAFC] font-bold">{student.gpa} / 20</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-[#222F46]/60">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Rang de classe :</span>
                <strong className="font-mono text-[#0F172A] dark:text-[#F8FAFC] font-bold">{student.classRank}e sur {student.totalStudentsInClass}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Appréciation :</span>
                <span className="text-[#0F172A] dark:text-[#F8FAFC] italic font-medium">{student.academicRemarks}</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]">Vie Scolaire & Discipline</span>
                {onOpenPenalty && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPenalty(student);
                    }}
                    className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>Gérer Pénalités</span>
                  </button>
                )}
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-[#222F46]/60">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Note de conduite :</span>
                <strong className="font-mono text-[#0F172A] dark:text-[#F8FAFC] font-bold">{student.conductScore} / 20</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-[#222F46]/60">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Pénalités actives :</span>
                <strong className={`font-mono font-bold ${activePenalties.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {activePenalties.length} ({student.disciplinePoints} pts / +{formatFCFA(student.penaltyTotalAmount || 0)})
                </strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Absences injustifiées :</span>
                <strong className="font-mono text-[#0F172A] dark:text-[#F8FAFC] font-bold">{student.unexcusedAbsences} jours</strong>
              </div>
            </div>
          </div>

          {/* Active Penalties List if any */}
          {activePenalties.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  Pénalités Actives ({activePenalties.length})
                </span>
                {onOpenPenalty && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPenalty(student);
                    }}
                    className="text-[11px] font-bold text-rose-700 dark:text-rose-400 underline"
                  >
                    Donner ou Retirer
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {activePenalties.map((p) => (
                  <div key={p.id} className="text-[11px] bg-white dark:bg-[#151D2E] p-2 rounded-xl border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{p.reason}</span>
                      <span className="text-[#64748B] dark:text-[#94A3B8] ml-1.5">({p.date} • {p.recordedBy})</span>
                    </div>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      {p.amount > 0 ? `+${formatFCFA(p.amount)}` : `-${p.pointsDeducted} pt`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parent Communication & Meetings */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]">Contact Parent & Assiduité aux Réunions</span>
              {isOverAbsence && (
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Seuil dépassé ({student.parentMeetingAbsences} abs.)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Tuteur légal :</span>
                <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">{student.parentName}</strong>
              </div>
              <div>
                <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Téléphone direct :</span>
                <strong className="font-mono text-[#0071E3] dark:text-[#38BDF8] font-bold">+{normalizedPhone}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#0F172A] border-t border-slate-200/80 dark:border-[#222F46] flex flex-wrap justify-end gap-2 shrink-0">
          {onOpenBulletin && (
            <button
              onClick={() => {
                onClose();
                onOpenBulletin(student);
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Voir le Bulletin Scolaire</span>
            </button>
          )}
          <button
            onClick={() => onOpenWhatsApp(student)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Ouvrir WhatsApp (+242)</span>
          </button>
          <button
            onClick={() => onOpenPayment(student)}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-[#0F172A] dark:bg-[#2563EB] hover:bg-black dark:hover:bg-blue-600 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            Encaisser
          </button>
        </div>
      </div>
    </div>
  );
};
