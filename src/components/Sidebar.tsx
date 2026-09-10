import React from 'react';
import { NavigationTab } from '../types';
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
  Moon
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
  activeUsersCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
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
}) => {
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
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0071E3] dark:bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
                <School className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[15px] tracking-tight text-[#1D1D1F] dark:text-[#F8FAFC]">
                    ADLON
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F4F5F7] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]">
                    ERP
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-none">
                  2026-2027 • Congo
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

          {/* Active telemetry signal */}
          <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]"></span>
              </span>
              <span className="text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Système Connecté</span>
            </div>
            <span className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8] font-semibold">
              {activeUsersCount} actifs
            </span>
          </div>

          {/* User Account */}
          <div className="px-3 py-1.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0F172A] dark:bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
              GB
            </div>
            <div className="overflow-hidden">
              <div className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                Gaston Bantsimba
              </div>
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                Directeur Général
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
