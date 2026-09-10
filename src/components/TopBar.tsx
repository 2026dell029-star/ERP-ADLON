import React from 'react';
import { NavigationTab } from '../types';
import { formatFCFA } from '../utils/formatters';
import { 
  Menu, 
  Search, 
  MessageCircle, 
  Wallet,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';

interface TopBarProps {
  activeTab: NavigationTab;
  onToggleSidebar: () => void;
  availableCash: number;
  monthlyPayroll: number;
  onQuickWhatsAppRelance: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Tableau de bord',
    subtitle: 'Vue d\'ensemble stratégique et statistiques d\'utilisation',
  },
  enrollment: {
    title: 'Inscriptions & Registre des Élèves',
    subtitle: 'Admissions 2026-2027, formulaires d\'inscription et attestations',
  },
  finance: {
    title: 'Finances & Recouvrement',
    subtitle: 'Calcul automatique du prorata temporis et encaissements',
  },
  crm: {
    title: 'CRM & Relances WhatsApp',
    subtitle: 'Canal direct E.164 (+242) pour impayés et convocations',
  },
  pedagogy: {
    title: 'Pédagogie & Vie Scolaire',
    subtitle: 'Résultats académiques, discipline et assiduité parentale',
  },
  grades: {
    title: 'Saisie des Notes & Bulletins Scolaires',
    subtitle: 'Calcul automatique des moyennes, des rangs officiels et bulletins',
  },
  staff: {
    title: 'Personnel & Paie',
    subtitle: 'Masse salariale fixe mensuelle et gestion des collaborateurs',
  },
  config: {
    title: 'Paramètres du Système',
    subtitle: 'Grilles tarifaires, règles d\'inscription et seuils d\'alerte',
  },
};

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onToggleSidebar,
  availableCash,
  monthlyPayroll,
  onQuickWhatsAppRelance,
  theme,
  onToggleTheme,
}) => {
  const current = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;
  const cashGap = availableCash - monthlyPayroll;
  const isDeficit = cashGap < 0;

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-[#111827]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E293B] flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] lg:hidden transition-colors"
          aria-label="Ouvrir la navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-tight tracking-tight">
            {current.title}
          </h1>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Theme switch, Cash Capsule & WhatsApp Action */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-full border border-slate-200/80 dark:border-[#222F46] bg-white dark:bg-[#151D2E] hover:bg-slate-50 dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center shadow-2xs transition-all"
          title={theme === 'dark' ? 'Basculer en Mode Clair' : 'Basculer en Mode Sombre'}
          aria-label="Changer de thème"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#F59E0B]" />
          ) : (
            <Moon className="w-4 h-4 text-[#0071E3]" />
          )}
        </button>

        {/* Available Cash vs Payroll Capsule */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] text-xs shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">Trésorerie :</span>
          <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            {formatFCFA(availableCash)}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className={`font-semibold ${isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {isDeficit ? 'Alerte Masse Salariale' : 'Couverture Salaires OK'}
          </span>
        </div>

        {/* WhatsApp Relance Action Button */}
        <button
          onClick={onQuickWhatsAppRelance}
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-2xs hover:shadow-xs transition-all shrink-0"
          title="Relancer les parents en retard de paiement via WhatsApp (+242)"
        >
          <MessageCircle className="w-4 h-4 shrink-0 fill-current" />
          <span className="hidden sm:inline">Relances WhatsApp (+242)</span>
          <span className="sm:hidden">WhatsApp</span>
        </button>
      </div>
    </header>
  );
};
