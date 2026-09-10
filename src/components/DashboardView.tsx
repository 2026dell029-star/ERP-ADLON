import React from 'react';
import { SchoolConfig, Student, UserStats, NavigationTab } from '../types';
import { formatFCFA, cleanPhoneNumber } from '../utils/formatters';
import { UserStatsSection } from './UserStatsSection';
import { 
  Wallet, 
  MessageCircle, 
  ChevronRight, 
  AlertCircle,
  PhoneCall,
  UserX,
  GraduationCap,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  config: SchoolConfig;
  students: Student[];
  userStats: UserStats;
  onOpenWhatsApp: (student: Student) => void;
  onOpenStudentDetail: (student: Student) => void;
  onOpenPayment: (student: Student) => void;
  onNavigateTab: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  config,
  students,
  userStats,
  onOpenWhatsApp,
  onOpenStudentDetail,
  onOpenPayment,
  onNavigateTab,
}) => {
  const totalDue = students.reduce((acc, s) => acc + s.totalDue, 0);
  const totalPaid = students.reduce((acc, s) => acc + s.totalPaid, 0);
  const totalBalance = students.reduce((acc, s) => acc + s.balanceRemaining, 0);
  const recoveryRate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

  const cashGap = config.availableBankCash - config.monthlyFixedPayroll;
  const isDeficit = cashGap < 0;

  const topUnpaid = [...students]
    .filter((s) => s.balanceRemaining > 0)
    .sort((a, b) => b.balanceRemaining - a.balanceRemaining);

  const meetingAlerts = students.filter(
    (s) => s.parentMeetingAbsences >= config.parentAbsenceAlertThreshold
  );

  return (
    <div className="space-y-6">
      {/* 1. STRATEGIC EXECUTIVE BANNER: Deep Midnight Blue & Royal Blue Gradient */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 shadow-lg transition-all bg-gradient-to-r from-[#0B132B] via-[#0F2856] to-[#1D4ED8] dark:bg-none dark:bg-[#151D2E] border border-blue-900/30 dark:border-[#222F46] text-white">
        {/* Subtle decorative radial glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-blue-100 flex items-center gap-1.5 shadow-2xs">
                <span className={`w-2 h-2 rounded-full ${isDeficit ? 'bg-amber-300' : 'bg-emerald-400'}`}></span>
                {isDeficit ? 'Attention Trésorerie Requise' : 'Trésorerie Équilibrée'}
              </span>
              <span className="text-xs text-blue-200/80">
                Année Scolaire 2026-2027 (10 mois)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Trésorerie Disponible vs Masse Salariale
            </h2>

            <p className="text-xs sm:text-sm text-blue-100/85 leading-relaxed">
              La trésorerie en banque s'élève à <strong className="text-white font-mono font-bold">{formatFCFA(config.availableBankCash)}</strong> face à une masse salariale fixe de <strong className="text-white font-mono font-bold">{formatFCFA(config.monthlyFixedPayroll)}</strong>.
              {isDeficit ? (
                <span className="text-amber-200 font-semibold block sm:inline sm:ml-1">
                  Écart de {formatFCFA(Math.abs(cashGap))}. Déclenchez la relance WhatsApp du Top Impayés pour sécuriser les salaires du 30.
                </span>
              ) : (
                <span className="text-emerald-300 font-semibold block sm:inline sm:ml-1">
                  Les engagements salariaux sont couverts.
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Glassmorphic Metric Box */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-right shadow-inner min-w-[180px]">
              <span className="text-[11px] text-blue-200/90 block font-medium">Couverture Salariale</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
                {Math.round((config.availableBankCash / config.monthlyFixedPayroll) * 100)}%
              </div>
              <span className="text-[11px] text-blue-200/80 block mt-0.5">
                {isDeficit ? `Besoin : ${formatFCFA(Math.max(0, -cashGap))}` : 'Position saine'}
              </span>
            </div>

            {isDeficit && topUnpaid.length > 0 && (
              <button
                onClick={() => onOpenWhatsApp(topUnpaid[0])}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-[#0071E3] font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-98"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Relancer {topUnpaid[0].parentName} ({formatFCFA(topUnpaid[0].balanceRemaining)})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MACRO FINANCIAL METRICS (Soft UI Cards with Circular Pastel Icon Pills) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Trésorerie en Banque */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Trésorerie Disponible</span>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#38BDF8] flex items-center justify-center shadow-2xs shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC] tracking-tight mt-2">
            {formatFCFA(config.availableBankCash)}
          </div>
          <div className="mt-2 text-xs flex justify-between text-[#64748B] dark:text-[#94A3B8]">
            <span>Masse salariale fixe :</span>
            <span className="font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{formatFCFA(config.monthlyFixedPayroll)}</span>
          </div>
        </div>

        {/* Card 2: Total Dû & Inscriptions */}
        <div 
          onClick={() => onNavigateTab('enrollment')}
          className="p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Total Facturé (Annuel)</span>
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC] tracking-tight mt-2">
            {formatFCFA(totalDue)}
          </div>
          <div className="mt-2 text-xs flex justify-between text-[#64748B] dark:text-[#94A3B8]">
            <span>Effectif inscrit :</span>
            <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#0071E3] transition-colors">{students.length} élèves →</span>
          </div>
        </div>

        {/* Card 3: Total Encaissé & Taux de Recouvrement */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Total Encaissé</span>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#34C759] dark:text-[#34D399] tracking-tight mt-2">
            {formatFCFA(totalPaid)}
          </div>
          <div className="mt-2 text-xs flex justify-between text-[#64748B] dark:text-[#94A3B8]">
            <span>Taux recouvrement :</span>
            <span className="font-mono font-semibold text-[#34C759] dark:text-[#34D399] bg-emerald-50 dark:bg-[#22C55E]/20 px-2 py-0.5 rounded-full">
              {recoveryRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Card 4: Reste à Recouvrer */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Reste à Recouvrer</span>
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-2xs shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#FF3B30] dark:text-[#F87171] tracking-tight mt-2">
            {formatFCFA(totalBalance)}
          </div>
          <div className="mt-2 text-xs flex justify-between text-[#64748B] dark:text-[#94A3B8]">
            <span>Dossiers avec solde :</span>
            <span className="font-semibold text-[#FF3B30] dark:text-[#F87171] bg-rose-50 dark:bg-[#EF4444]/20 px-2 py-0.5 rounded-full">
              {topUnpaid.length} dossiers
            </span>
          </div>
        </div>
      </div>

      {/* 3. DEDICATED SECTION: USER STATISTICS ON DASHBOARD */}
      <UserStatsSection stats={userStats} />

      {/* 4. OPERATIONAL GRIDS: Top Impayés & Alertes Réunions Parents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Top Impayés */}
        <div className="lg:col-span-7 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#222F46] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                <MessageCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Top Impayés & Action Rapide WhatsApp
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Génération automatique du lien direct +242 avec solde restant
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('crm')}
              className="text-xs font-semibold text-[#0071E3] hover:text-[#005bb5] flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#222F46]">
            {topUnpaid.slice(0, 4).map((student) => {
              const normalizedPhone = cleanPhoneNumber(student.parentPhone, config.countryCode);

              return (
                <div key={student.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 p-2.5 rounded-2xl transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenStudentDetail(student)}
                        className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#0071E3] text-left"
                      >
                        {student.firstName} {student.lastName}
                      </button>
                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-mono">({student.classLevel})</span>
                    </div>
                    <div className="text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2">
                      <span>Tuteur : <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{student.parentName}</strong></span>
                      <span>•</span>
                      <span className="font-mono">+{normalizedPhone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">Reste dû :</span>
                      <span className="text-sm font-bold font-mono text-[#FF3B30] dark:text-[#F87171]">
                        {formatFCFA(student.balanceRemaining)}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenWhatsApp(student)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#005bb5] text-white text-xs font-semibold transition-all shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Relancer (+242)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Alertes Assiduité Réunions Parents */}
        <div className="lg:col-span-5 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#222F46] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <UserX className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  Alertes Réunions Parents
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Seuil configuré (≥ {config.parentAbsenceAlertThreshold} absences)
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-[#EF4444]/20 text-[#FF3B30] dark:text-[#F87171]">
              {meetingAlerts.length} alertes
            </span>
          </div>

          {meetingAlerts.length > 0 ? (
            <div className="space-y-2.5">
              {meetingAlerts.map((student) => (
                <div key={student.id} className="p-3 rounded-2xl border border-slate-200/70 dark:border-[#222F46] bg-[#F8FAFC] dark:bg-[#0F172A] flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{student.parentName}</strong>
                      <span className="text-[#64748B] dark:text-[#94A3B8]">({student.firstName} - {student.classLevel})</span>
                    </div>
                    <p className="text-[#64748B] dark:text-[#94A3B8] mt-1">
                      {student.parentMeetingAbsences} absences sur {student.parentMeetingTotal} réunions • Moyenne : <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{student.gpa}/20</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenWhatsApp(student)}
                    className="px-3 py-1.5 rounded-full bg-[#0F172A] hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-[11px] shrink-0 transition-colors"
                  >
                    Convoquer
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
              Aucun parent n'a franchi le seuil d'alerte.
            </div>
          )}

          {/* Shortcut to Prorata Temporis */}
          <div className="p-4 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/70 dark:border-[#222F46] rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block">Moteur Prorata Temporis</span>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Exemple CE2 au 3 novembre : 144 000 FCFA</p>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs font-semibold text-[#0071E3] hover:underline"
            >
              Simulateur →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

