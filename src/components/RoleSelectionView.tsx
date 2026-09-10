import React from 'react';
import { UserRole, School, ROLE_PERMISSIONS } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Wallet, 
  GraduationCap, 
  ArrowRight, 
  Building2, 
  LogOut, 
  Sun, 
  Moon
} from 'lucide-react';

interface RoleSelectionViewProps {
  currentSchool: School;
  onSelectRole: (role: UserRole) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({
  currentSchool,
  onSelectRole,
  theme,
  onToggleTheme,
}) => {
  const { user, logOut } = useAuth();

  const roles: {
    role: UserRole;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    hoverBorder: string;
    shadowColor: string;
  }[] = [
    {
      role: 'dirigeant',
      icon: ShieldCheck,
      gradient: 'from-amber-500 to-orange-600',
      hoverBorder: 'hover:border-amber-500/80 dark:hover:border-amber-500/80',
      shadowColor: 'hover:shadow-amber-500/15',
    },
    {
      role: 'gestionnaire',
      icon: Wallet,
      gradient: 'from-blue-600 to-indigo-600',
      hoverBorder: 'hover:border-blue-500/80 dark:hover:border-blue-500/80',
      shadowColor: 'hover:shadow-blue-500/15',
    },
    {
      role: 'directeur',
      icon: GraduationCap,
      gradient: 'from-emerald-600 to-teal-600',
      hoverBorder: 'hover:border-emerald-500/80 dark:hover:border-emerald-500/80',
      shadowColor: 'hover:shadow-emerald-500/15',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0F19] text-[#1D1D1F] dark:text-[#F8FAFC] flex flex-col justify-between transition-colors antialiased">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-[#1E293B] bg-white/70 dark:bg-[#111827]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-[#0F172A] dark:text-[#F8FAFC] block leading-none">
              ERP ADLON
            </span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase mt-1 block">
              {currentSchool.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#64748B] dark:text-[#94A3B8]">Connecté :</span>
            <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{user?.displayName || user?.email}</strong>
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => logOut()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Sélectionnez votre rôle
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto mt-2">
            Choisissez votre profil d'accès pour démarrer votre session de travail.
          </p>
        </div>

        {/* Simplified Role Cards: Icons + Titles only */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto w-full">
          {roles.map(({ role, icon: Icon, gradient, hoverBorder, shadowColor }) => {
            const config = ROLE_PERMISSIONS[role];
            return (
              <button
                key={role}
                type="button"
                onClick={() => onSelectRole(role)}
                className={`group bg-white dark:bg-[#111827] border-2 border-slate-200/90 dark:border-[#1E293B] ${hoverBorder} ${shadowColor} rounded-2xl p-6 sm:p-8 cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1.5 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden`}
              >
                {/* Background Accent Top Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient}`} />

                {/* Role Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>

                {/* Role Title */}
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {config.title}
                  </h2>
                </div>

                {/* Action arrow */}
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Accéder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-slate-200/80 dark:border-[#1E293B] bg-white/50 dark:bg-[#111827]/50 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
        <span>ERP ADLON • {currentSchool.name}</span>
      </footer>
    </div>
  );
};
