import React, { useState } from 'react';
import { UserStats } from '../types';
import { 
  Users, 
  Clock, 
  ShieldCheck, 
  Activity, 
  ChevronRight,
  Filter
} from 'lucide-react';

interface UserStatsSectionProps {
  stats: UserStats;
}

export const UserStatsSection: React.FC<UserStatsSectionProps> = ({ stats }) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'roles' | 'hourly' | 'audit'>('overview');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  const filteredAuditLogs = selectedRoleFilter === 'all' 
    ? stats.recentAuditLogs 
    : stats.recentAuditLogs.filter(log => log.role.toLowerCase().includes(selectedRoleFilter.toLowerCase()));

  return (
    <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] overflow-hidden shadow-sm">
      {/* Header with Segmented Control */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-[#222F46] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Activité & Statistiques Utilisateurs
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {stats.activeUsersNow} en direct
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 ml-10">
            Télémétrie de la plateforme, répartition par profil et traçabilité des opérations
          </p>
        </div>

        {/* Soft UI Segmented Control */}
        <div className="flex items-center bg-[#F1F5F9] dark:bg-[#0F172A] p-1 rounded-2xl text-xs font-medium text-[#64748B] dark:text-[#94A3B8] self-start md:self-auto border border-slate-200/50 dark:border-[#222F46] max-w-full overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-medium ${
              activeSubTab === 'overview'
                ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold shadow-xs'
                : 'hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            Vue générale
          </button>
          <button
            onClick={() => setActiveSubTab('roles')}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-medium ${
              activeSubTab === 'roles'
                ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold shadow-xs'
                : 'hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            Rôles ({stats.roleBreakdown.length})
          </button>
          <button
            onClick={() => setActiveSubTab('hourly')}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-medium ${
              activeSubTab === 'hourly'
                ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold shadow-xs'
                : 'hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            Affluence horaire
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-medium ${
              activeSubTab === 'audit'
                ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-semibold shadow-xs'
                : 'hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            Audit ({stats.recentAuditLogs.length})
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW SUB-TAB */}
      {activeSubTab === 'overview' && (
        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/60 dark:border-[#222F46]">
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] block">Actifs au quotidien (DAU)</span>
              <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1 font-mono tracking-tight">
                {stats.dailyActiveUsers}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
                +12% vs semaine passée
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/60 dark:border-[#222F46]">
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] block">Actifs par mois (MAU)</span>
              <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1 font-mono tracking-tight">
                {stats.monthlyActiveUsers}
              </div>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block mt-1">
                Sur 320 comptes créés
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/60 dark:border-[#222F46]">
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] block">Durée moyenne session</span>
              <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1 font-mono tracking-tight">
                {stats.avgSessionMinutes} <span className="text-sm font-normal text-[#64748B] dark:text-[#94A3B8]">min</span>
              </div>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block mt-1">
                Temps d'attention soutenu
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/60 dark:border-[#222F46]">
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] block">Disponibilité système</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono tracking-tight">
                {stats.systemAvailability}%
              </div>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block mt-1">
                Zéro interruption non planifiée
              </span>
            </div>
          </div>

          {/* Module Adoption Progress Bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
              Taux d'adoption par module
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.moduleAdoption.map((mod) => (
                <div key={mod.module} className="p-3.5 rounded-xl border border-[#E5E5EA] bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1D1D1F]">{mod.module}</span>
                    <span className="font-mono font-medium text-[#0071E3]">{mod.adoptionRate}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0071E3] rounded-full transition-all duration-300"
                      style={{ width: `${mod.adoptionRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#86868B]">
                    <span>{mod.totalActionsWeek} opérations cette semaine</span>
                    <span className="text-[#34C759]">{mod.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. ROLES SUB-TAB */}
      {activeSubTab === 'roles' && (
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F5F7] text-[#86868B] font-medium border-b border-[#E5E5EA]">
                <tr>
                  <th className="py-2.5 px-4">Profil d'accès</th>
                  <th className="py-2.5 px-4">Comptes configurés</th>
                  <th className="py-2.5 px-4 font-mono">Actifs aujourd'hui</th>
                  <th className="py-2.5 px-4 font-mono">Temps moyen</th>
                  <th className="py-2.5 px-4 text-right">Taux d'engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5EA] text-[#1D1D1F]">
                {stats.roleBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#86868B]">
                      Aucun profil utilisateur configuré pour le moment.
                    </td>
                  </tr>
                ) : (
                  stats.roleBreakdown.map((r) => {
                    const rate = r.totalAccounts > 0 ? Math.round((r.activeToday / r.totalAccounts) * 100) : 0;
                    return (
                      <tr key={r.role} className="hover:bg-[#F5F5F7]/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#1D1D1F]">{r.role}</td>
                        <td className="py-3 px-4 text-[#86868B]">{r.totalAccounts} comptes</td>
                        <td className="py-3 px-4 font-mono font-semibold text-[#1D1D1F]">{r.activeToday}</td>
                        <td className="py-3 px-4 font-mono text-[#86868B]">{r.avgDailyTimeMin} min / jour</td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-semibold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full">
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. HOURLY ACTIVITY SUB-TAB */}
      {activeSubTab === 'hourly' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#86868B]">
            <span>Courbe de charge des connexions journalières</span>
            <span className="flex items-center gap-1.5 text-[#0071E3] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#0071E3]"></span>
              Activité en temps réel
            </span>
          </div>

          {stats.hourlyActivity.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-[#E5E5EA] text-[#86868B] text-xs">
              Les statistiques horaires seront compilées au fur et à mesure de l'utilisation de l'établissement.
            </div>
          ) : (
            <div className="h-44 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-[#E5E5EA]">
              {stats.hourlyActivity.map((item) => (
                <div key={item.hour} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="text-[10px] font-mono text-[#86868B] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.trafficPct}%
                  </div>
                  <div 
                    className={`w-full rounded-t-md transition-all ${
                      item.isPeak ? 'bg-[#0071E3]' : 'bg-[#E5E5EA] group-hover:bg-[#0071E3]/50'
                    }`}
                    style={{ height: `${item.trafficPct}%` }}
                  />
                  <span className="text-[10px] font-mono text-[#86868B]">{item.hour}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
            <div className="p-3 rounded-lg bg-[#F5F5F7] border border-[#E5E5EA]/60">
              <span className="text-[11px] text-[#86868B] block">07h30 - 08h30</span>
              <strong className="text-[#1D1D1F] block mt-0.5">Appel & Absences</strong>
              <p className="text-[11px] text-[#86868B]">Saisie des retards par la Vie Scolaire.</p>
            </div>
            <div className="p-3 rounded-lg bg-[#F5F5F7] border border-[#E5E5EA]/60">
              <span className="text-[11px] text-[#86868B] block">12h00 - 13h00</span>
              <strong className="text-[#1D1D1F] block mt-0.5">Pointage Cantine</strong>
              <p className="text-[11px] text-[#86868B]">Contrôle des présences au réfectoire.</p>
            </div>
            <div className="p-3 rounded-lg bg-[#F5F5F7] border border-[#E5E5EA]/60">
              <span className="text-[11px] text-[#86868B] block">16h30 - 18h00</span>
              <strong className="text-[#1D1D1F] block mt-0.5">Caisse & WhatsApp</strong>
              <p className="text-[11px] text-[#86868B]">Clôture comptable et relances impayés.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. AUDIT LOG SUB-TAB */}
      {activeSubTab === 'audit' && (
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#86868B]">
              Journal de traçabilité immuable (non-répudiation des opérations sensibles)
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#86868B]" />
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[#E5E5EA] bg-white text-[#1D1D1F] text-xs"
              >
                <option value="all">Tous les profils</option>
                <option value="Directeur">Direction</option>
                <option value="Comptable">Comptabilité</option>
                <option value="Enseignant">Enseignants</option>
                <option value="Surveillant">Vie Scolaire</option>
              </select>
            </div>
          </div>

          {filteredAuditLogs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-[#E5E5EA] text-[#86868B] text-xs">
              Aucune action enregistrée dans le journal d'audit pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-[#E5E5EA] border border-[#E5E5EA] rounded-xl overflow-hidden text-xs">
              {filteredAuditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-white hover:bg-[#F5F5F7]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-[#1D1D1F] font-semibold">{log.user}</strong>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F5F5F7] text-[#86868B]">
                        {log.role}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0071E3]/10 text-[#0071E3] font-medium">
                        {log.category}
                      </span>
                    </div>
                    <p className="text-[#1D1D1F]">{log.action}</p>
                  </div>

                  <div className="text-right shrink-0 text-[11px] text-[#86868B] font-mono">
                    <div>{log.timestamp}</div>
                    <div className="text-[10px] text-[#86868B]/70">{log.ip}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
