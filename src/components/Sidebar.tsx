import React from 'react';
import { NavigationTab, SchoolConfig } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserPlus,
  CreditCard, 
  MessageCircle, 
  GraduationCap, 
  Award,
  Users2, 
  Settings, 
  X,
  School,
  Sun,
  Moon,
  Flame,
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
  activeUsersCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  config?: SchoolConfig;
  onOpenAuthModal?: () => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  activeUsersCount,
  theme,
  onToggleTheme,
  config,
  onOpenAuthModal,
}) => {
  const { user } = useAuth();
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      id: 'enrollment',
      label: 'Inscriptions & Élèves',
      icon: UserPlus,
      badge: 'Rentrée',
    },
    {
      id: 'finance',
      label: 'Finances & Prorata',
      icon: CreditCard,
    },
    {
      id: 'crm',
      label: 'CRM & WhatsApp (+242)',
      icon: MessageCircle,
      badge: 'Direct',
    },
    {
      id: 'pedagogy',
      label: 'Pédagogie & Radar',
      icon: GraduationCap,
    },
    {
      id: 'grades',
      label: 'Notes & Bulletins',
      icon: Award,
      badge: 'Auto',
    },
    {
      id: 'staff',
      label: 'Personnel & Paie',
      icon: Users2,
    },
    {
      id: 'config',
      label: 'Paramètres',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 h-screen max-h-screen bg-white dark:bg-[#111827] border-r border-[#E2E8F0] dark:border-[#1E293B] flex flex-col justify-between overflow-hidden transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header + Scrollable Navigation Area */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Top Header */}
          <div className="shrink-0 h-16 px-5 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#0071E3] dark:bg-[#2563EB] shrink-0 flex items-center justify-center text-white shadow-xs">
                <School className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[14px] tracking-tight text-[#1D1D1F] dark:text-[#F8FAFC] truncate max-w-[125px]" title={config?.schoolName || 'ERP ADLON'}>
                    {config?.schoolName ? (config.schoolName.replace(/^Complexe\s+Scolaire\s+(Privé\s+)?/i, '') || config.schoolName) : 'ADLON'}
                  </span>
                  <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-[#F4F5F7] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] shrink-0">
                    ERP
                  </span>
                </div>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] leading-none truncate mt-0.5">
                  {config?.academicYear || '2026-2027'} • {config?.schoolCity || 'Congo'}
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1D1D1F] dark:hover:text-[#F8FAFC] lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section with Smooth Scrolling */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Modules de Gestion
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0071E3] dark:bg-[#2563EB] text-white shadow-sm'
                      : 'text-[#0F172A] dark:text-[#E2E8F0] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-white/20 text-white' : 'text-[#64748B] dark:text-[#94A3B8]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-50 text-[#0071E3] dark:bg-[#1E293B] dark:text-[#38BDF8]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Theme Switcher & User Account */}
        <div className="shrink-0 p-3 border-t border-slate-200/80 dark:border-[#1E293B] space-y-2 bg-[#F8FAFC] dark:bg-[#0B0F19]">
          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className="w-full px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-[#222F46] bg-white dark:bg-[#151D2E] hover:bg-slate-50 dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-between text-xs font-semibold transition-all shadow-2xs"
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-[#38BDF8]" />
              ) : (
                <Sun className="w-4 h-4 text-[#F59E0B]" />
              )}
              <span>{theme === 'dark' ? 'Mode Sombre Actif' : 'Mode Clair Actif'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-[#1E293B] text-[#0071E3] dark:text-[#38BDF8] font-semibold">
              Basculer
            </span>
          </button>

          {/* Active telemetry signal & Firebase Status */}
          <div className="px-3 py-1.5 rounded-2xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">Firestore</span>
                <span className="text-[9px] text-[#64748B] dark:text-[#94A3B8] font-mono">erp-adlon</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En direct
            </span>
          </div>

          {/* User Account / Auth trigger */}
          {user ? (
            <button
              onClick={onOpenAuthModal}
              className="w-full text-left px-3 py-2 rounded-2xl border border-slate-200/80 dark:border-[#222F46] bg-white dark:bg-[#151D2E] hover:bg-slate-50 dark:hover:bg-[#1E293B] flex items-center gap-3 transition-colors cursor-pointer group"
              title="Gérer le compte Firebase"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden shadow-2xs">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (user.displayName || user.email || 'A').charAt(0).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate group-hover:text-blue-500 transition-colors">
                  {user.displayName || 'Administrateur'}
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate font-mono">
                  {user.email}
                </div>
              </div>
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500 shrink-0" />
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="w-full px-3 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white flex items-center justify-center gap-2 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Connexion (Email / Google)</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
