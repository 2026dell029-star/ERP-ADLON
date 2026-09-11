import React from 'react';
import { NavigationTab, SchoolConfig, UserRole, School as SchoolType, ROLE_PERMISSIONS } from '../types';
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
  ShieldCheck,
  Building2,
  Repeat,
  Wallet
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
  activeUsersCount?: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  config?: SchoolConfig;
  currentSchool?: SchoolType;
  activeRole?: UserRole;
  onChangeRole?: () => void;
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
  theme,
  onToggleTheme,
  config,
  currentSchool,
  activeRole = 'dirigeant',
  onChangeRole,
}) => {
  const { user, logOut } = useAuth();
  const roleConfig = ROLE_PERMISSIONS[activeRole] || ROLE_PERMISSIONS.dirigeant;

  const allNavItems: NavItem[] = [
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
      label: 'Finances & Caisses',
      icon: CreditCard,
    },
    {
      id: 'crm',
      label: 'CRM WhatsApp',
      icon: MessageCircle,
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

  // Filter allowed navigation items according to current role
  const visibleNavItems = allNavItems.filter((item) =>
    roleConfig.allowedTabs.includes(item.id)
  );

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
          {/* Top School Header */}
          <div className="shrink-0 p-4 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-slate-50/70 dark:bg-[#0B0F19]/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {currentSchool?.logo || config?.schoolLogo ? (
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center p-0.5 shadow-xs overflow-hidden">
                    <img
                      src={currentSchool?.logo || config?.schoolLogo}
                      alt={currentSchool?.name || config?.schoolName || 'Logo'}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-blue-600 shrink-0 flex items-center justify-center text-white shadow-xs">
                    <School className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="font-bold text-[13px] tracking-tight text-[#1D1D1F] dark:text-[#F8FAFC] truncate block" title={currentSchool?.name || config?.schoolName || 'ERP ADLON'}>
                    {currentSchool?.name || config?.schoolName || 'ERP ADLON'}
                  </span>
                  <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] leading-none truncate mt-0.5">
                    {currentSchool?.city || config?.schoolCity || 'Brazzaville'} • {currentSchool?.academicYear || config?.academicYear || '2026-2027'}
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
          </div>

          {/* Role Status Card */}
          <div className="p-3 border-b border-slate-100 dark:border-[#1E293B]">
            <div className="p-2.5 rounded-xl bg-slate-100/90 dark:bg-[#1E293B]/80 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  Rôle Actif
                </span>
                {onChangeRole && (
                  <button
                    onClick={onChangeRole}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Changer
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  {activeRole === 'dirigeant' && <ShieldCheck className="w-3.5 h-3.5" />}
                  {activeRole === 'gestionnaire' && <Wallet className="w-3.5 h-3.5" />}
                  {activeRole === 'directeur' && <GraduationCap className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                    {roleConfig.title}
                  </div>
                  <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate">
                    {roleConfig.allowedTabs.length} modules autorisés
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Modules Autorisés
            </div>

            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[#0F172A] dark:text-[#E2E8F0] hover:bg-slate-100 dark:hover:bg-[#1E293B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      isActive ? 'bg-white/20 text-white' : 'text-[#64748B] dark:text-[#94A3B8]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-50 text-blue-600 dark:bg-[#1E293B] dark:text-blue-300'
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

        {/* Bottom Section: Theme & Account */}
        <div className="shrink-0 p-3 border-t border-slate-200/80 dark:border-[#1E293B] space-y-2 bg-[#F8FAFC] dark:bg-[#0B0F19]">
          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-[#222F46] bg-white dark:bg-[#151D2E] hover:bg-slate-50 dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-between text-xs font-semibold transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>{theme === 'dark' ? 'Mode Sombre' : 'Mode Clair'}</span>
            </div>
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Basculer</span>
          </button>

          {/* User Account with logout */}
          {user && (
            <div className="p-2 rounded-xl border border-slate-200/80 dark:border-[#222F46] bg-white dark:bg-[#151D2E] flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden min-w-0">
                  <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                    {user.displayName || 'Utilisateur'}
                  </div>
                  <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate font-mono">
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={() => logOut()}
                title="Déconnexion"
                className="p-1.5 rounded-lg text-[#64748B] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
