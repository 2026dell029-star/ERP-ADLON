import React from 'react';
import { NavigationTab, UserRole, School as SchoolType, ROLE_PERMISSIONS } from '../types';
import { formatFCFA } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  MessageCircle, 
  Wallet, 
  Sun, 
  Moon, 
  ShieldCheck,
  Building2,
  GraduationCap,
  Repeat
} from 'lucide-react';

interface TopBarProps {
  activeTab: NavigationTab;
  onToggleSidebar: () => void;
  availableCash: number;
  monthlyPayroll: number;
  onQuickWhatsAppRelance: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeRole?: UserRole;
  currentSchool?: SchoolType;
  onChangeRole?: () => void;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Tableau de bord',
    subtitle: 'Vue d\'ensemble stratégique et indicateurs clés',
  },
  enrollment: {
    title: 'Inscriptions & Registre des Élèves',
    subtitle: 'Admissions 2026-2027, formulaires d\'inscription et dossiers',
  },
  finance: {
    title: 'Finances & Recouvrement',
    subtitle: 'Calcul automatique du prorata temporis et encaissements',
  },
  crm: {
    title: 'CRM WhatsApp',
    subtitle: 'Canal direct pour impayés, convocations et félicitations',
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
  activeRole = 'dirigeant',
  currentSchool,
  onChangeRole,
}) => {
  const current = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;
  const roleConfig = ROLE_PERMISSIONS[activeRole] || ROLE_PERMISSIONS.dirigeant;
  const cashGap = availableCash - monthlyPayroll;
  const isDeficit = cashGap < 0;

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-[#111827]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E293B] flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] lg:hidden transition-colors shrink-0"
          aria-label="Ouvrir la navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-tight tracking-tight truncate">
            {current.title}
          </h1>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] hidden sm:block truncate">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Badges, Switchers, Cash Capsule & WhatsApp */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        
        {/* Active School Badge */}
        {currentSchool && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151D2E] text-xs shadow-2xs">
            {currentSchool.logo || currentSchool.logoUrl ? (
              <img
                src={currentSchool.logo || currentSchool.logoUrl}
                alt={currentSchool.name}
                className="w-4 h-4 rounded-full object-contain"
              />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            )}
            <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] max-w-[150px] truncate">
              {currentSchool.name}
            </span>
          </div>
        )}

        {/* Active Role Pill / Switcher */}
        {onChangeRole && (
          <button
            onClick={onChangeRole}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all cursor-pointer shadow-2xs group"
            title="Changer de rôle actif"
          >
            {activeRole === 'dirigeant' && <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            {activeRole === 'gestionnaire' && <Wallet className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
            {activeRole === 'directeur' && <GraduationCap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
            <span>Rôle : <strong>{roleConfig.title}</strong></span>
            <Repeat className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
          </button>
        )}

        {/* Quick Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-full border border-slate-200/80 dark:border-[#222F46] bg-white dark:bg-[#151D2E] hover:bg-slate-50 dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center shadow-2xs transition-all cursor-pointer"
          title={theme === 'dark' ? 'Basculer en Mode Clair' : 'Basculer en Mode Sombre'}
          aria-label="Changer de thème"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#F59E0B]" />
          ) : (
            <Moon className="w-4 h-4 text-[#0071E3]" />
          )}
        </button>

        {/* Available Cash vs Payroll Capsule (only for Dirigeant & Gestionnaire) */}
        {roleConfig.canManageFinances && (
          <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] text-xs shadow-2xs">
            <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <Wallet className="w-3 h-3" />
            </div>
            <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">Trésorerie :</span>
            <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {formatFCFA(availableCash)}
            </span>
          </div>
        )}

        {/* WhatsApp Relance Action Button (if Dirigeant) */}
        {roleConfig.canManageFinances && (
          <button
            onClick={onQuickWhatsAppRelance}
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#25D366] hover:bg-[#20BD5A] text-white shadow-2xs hover:shadow-xs transition-all shrink-0 cursor-pointer"
            title="CRM WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0 fill-current" />
            <span className="hidden sm:inline">CRM WhatsApp</span>
          </button>
        )}
      </div>
    </header>
  );
};
