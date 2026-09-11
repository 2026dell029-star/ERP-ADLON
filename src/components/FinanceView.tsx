import React, { useState, useMemo } from 'react';
import { SchoolConfig, Student } from '../types';
import { formatFCFA, getClassesForCycle } from '../utils/formatters';
import { 
  Search, 
  Receipt,
  MessageCircle,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface FinanceViewProps {
  config: SchoolConfig;
  students: Student[];
  onOpenPayment: (student: Student) => void;
  onOpenStudentDetail: (student: Student) => void;
  onOpenWhatsApp: (student: Student) => void;
  onAddNewStudent?: (newStudent: Student) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  config,
  students,
  onOpenPayment,
  onOpenStudentDetail,
  onOpenWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const availableClassesForCycle = getClassesForCycle(selectedCycle, config);

  // Real financial aggregates computed strictly from user-entered students
  const totalBilled = useMemo(() => {
    return students.reduce((sum, s) => sum + (s.totalDue || 0), 0);
  }, [students]);

  const totalCollected = useMemo(() => {
    return students.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
  }, [students]);

  const totalRemaining = useMemo(() => {
    return students.reduce((sum, s) => sum + (s.balanceRemaining || 0), 0);
  }, [students]);

  const recoveryRate = useMemo(() => {
    if (totalBilled <= 0) return 0;
    return Math.round((totalCollected / totalBilled) * 100);
  }, [totalBilled, totalCollected]);

  // All real payments registered by user
  const allPayments = useMemo(() => {
    const list: {
      id: string;
      date: string;
      amount: number;
      method: string;
      studentName: string;
      matricule: string;
      classLevel: string;
      cashierName?: string;
    }[] = [];

    students.forEach((s) => {
      (s.payments || []).forEach((p) => {
        list.push({
          id: p.id,
          date: p.date,
          amount: p.amount,
          method: p.method,
          studentName: `${s.firstName} ${s.lastName}`,
          matricule: s.matricule,
          classLevel: s.classLevel,
          cashierName: p.cashierName,
        });
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.matricule.toLowerCase().includes(q) ||
        (s.parentName || '').toLowerCase().includes(q) ||
        (s.parentPhone || '').includes(q);
      const matchesCycle = selectedCycle === 'all' || s.cycle === selectedCycle;
      const matchesClass = selectedClass === 'all' || s.classLevel.toLowerCase() === selectedClass.toLowerCase();
      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
      return matchesSearch && matchesCycle && matchesClass && matchesStatus;
    });
  }, [students, searchTerm, selectedCycle, selectedClass, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* 1. FINANCIAL KPI SUMMARY CARDS (Strictly Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span className="font-semibold uppercase tracking-wider">Total Facturé</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-[#0F172A] dark:text-[#F8FAFC]">
            {formatFCFA(totalBilled)}
          </div>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            {students.length} élève{students.length > 1 ? 's' : ''} inscrit{students.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Total Collected */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span className="font-semibold uppercase tracking-wider">Total Encaissé</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {formatFCFA(totalCollected)}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {allPayments.length} versement{allPayments.length > 1 ? 's' : ''} enregistré{allPayments.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Total Remaining */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span className="font-semibold uppercase tracking-wider">Reste à Recouvrer</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
            {formatFCFA(totalRemaining)}
          </div>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Créances scolaires en attente
          </p>
        </div>

        {/* Recovery Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span className="font-semibold uppercase tracking-wider">Taux de Recouvrement</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-[#0F172A] dark:text-[#F8FAFC]">
            {recoveryRate} %
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#0F172A] rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-[#0071E3] h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, recoveryRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. RECOVERY & CASH TABLE */}
      <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm overflow-hidden">
        {/* Header & Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-[#222F46] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher élève, matricule, parent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200/80 dark:border-[#222F46] rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedCycle}
              onChange={(e) => {
                setSelectedCycle(e.target.value);
                setSelectedClass('all');
              }}
              className="border border-slate-200/80 dark:border-[#222F46] rounded-2xl px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#0F172A]"
            >
              <option value="all">Tous les cycles</option>
              <option value="Préscolaire">Préscolaire</option>
              <option value="Primaire">Primaire</option>
              <option value="Collège">Collège</option>
              <option value="Lycée">Lycée</option>
            </select>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-slate-200/80 dark:border-[#222F46] rounded-2xl px-3 py-2 font-medium text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#0F172A]"
            >
              <option value="all">
                {selectedCycle === 'all' ? 'Toutes les classes' : `Toutes (${selectedCycle})`}
              </option>
              {availableClassesForCycle.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-200/80 dark:border-[#222F46] rounded-2xl px-3 py-2 text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#0F172A]"
            >
              <option value="all">Tous les statuts</option>
              <option value="solde">Soldé</option>
              <option value="partiel">Partiel</option>
              <option value="impaye">Impayé</option>
            </select>
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Aucun élève enregistré
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              Toutes les données financières sont vierges. Le registre comptable s'actualisera en direct dès que vous créerez des élèves dans le module Inscriptions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] font-medium border-b border-slate-200/80 dark:border-[#222F46]">
                <tr>
                  <th className="py-3 px-4">Élève / Matricule</th>
                  <th className="py-3 px-4">Cycle & Classe</th>
                  <th className="py-3 px-4">Durée</th>
                  <th className="py-3 px-4 font-mono text-right">Total Dû</th>
                  <th className="py-3 px-4 font-mono text-right">Payé</th>
                  <th className="py-3 px-4 font-mono text-right">Reste Dû</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-[#222F46] text-[#0F172A] dark:text-[#F8FAFC]">
                {filteredStudents.map((s) => {
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-[#1E293B]/40 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onOpenStudentDetail(s)}
                          className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#0071E3] text-left block"
                        >
                          {s.firstName} {s.lastName}
                        </button>
                        <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">{s.matricule}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{s.classLevel}</span>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">{s.cycle}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-medium">{s.monthsEnrolled || 10} / {config.schoolDurationMonths || 10} mois</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-right font-medium">
                        {formatFCFA(s.totalDue)}
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatFCFA(s.totalPaid)}
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-rose-600 dark:text-rose-400 font-semibold">
                        {formatFCFA(s.balanceRemaining)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          s.status === 'solde' 
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                            : s.status === 'partiel'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#38BDF8]'
                            : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                        }`}>
                          {s.status === 'solde' ? 'Soldé' : s.status === 'partiel' ? 'Partiel' : 'Impayé'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenPayment(s)}
                            className="px-3 py-1.5 rounded-xl bg-[#0F172A] dark:bg-[#2563EB] hover:bg-black dark:hover:bg-blue-600 text-white font-medium text-[11px] shadow-2xs cursor-pointer"
                          >
                            Encaisser
                          </button>
                          {s.balanceRemaining > 0 && (
                            <button
                              onClick={() => onOpenWhatsApp(s)}
                              className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#38BDF8] hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                              title="CRM WhatsApp Relance"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. HISTORIQUE DES ENCAISSEMENTS RÉELS */}
      {allPayments.length > 0 && (
        <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#0071E3]" />
              <span>Derniers Versements Encaissés</span>
            </h3>
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {allPayments.length} transaction{allPayments.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] font-medium border-b border-slate-200/80 dark:border-[#222F46]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Élève</th>
                  <th className="py-2.5 px-3">Classe</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Encaissé par</th>
                  <th className="py-2.5 px-3 font-mono text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-[#222F46] text-[#0F172A] dark:text-[#F8FAFC]">
                {allPayments.slice(0, 10).map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-mono">{p.date}</td>
                    <td className="py-2.5 px-3 font-medium">{p.studentName}</td>
                    <td className="py-2.5 px-3">{p.classLevel}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#0F172A] text-[10px] font-medium">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#64748B] dark:text-[#94A3B8]">{p.cashierName || 'Direction'}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-emerald-600 dark:text-emerald-400">
                      +{formatFCFA(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
