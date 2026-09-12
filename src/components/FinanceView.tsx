import React, { useState, useMemo } from 'react';
import { SchoolConfig, Student, StaffMember } from '../types';
import { formatFCFA, getClassesForCycle } from '../utils/formatters';
import { 
  printAccountingDocument,
  openAccountingDocumentInNewTab,
  downloadAccountingCSV,
  AccountingDocumentType,
  generateBilanHtml,
  generateCompteResultatHtml,
  generateLivreJournalHtml,
  generateBalanceComptesHtml
} from '../utils/accountingPrinter';
import { 
  Search, 
  Receipt,
  MessageCircle,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  FileText,
  TrendingUp,
  BookOpen,
  Scale,
  Download,
  Eye,
  X,
  Sparkles
} from 'lucide-react';

interface FinanceViewProps {
  config: SchoolConfig;
  students: Student[];
  staff?: StaffMember[];
  onOpenPayment: (student: Student) => void;
  onOpenStudentDetail: (student: Student) => void;
  onOpenWhatsApp: (student: Student) => void;
  onAddNewStudent?: (newStudent: Student) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  config,
  students,
  staff = [],
  onOpenPayment,
  onOpenStudentDetail,
  onOpenWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Preview Modal State for Accounting Docs
  const [activePreviewDoc, setActivePreviewDoc] = useState<AccountingDocumentType | null>(null);

  const availableClassesForCycle = getClassesForCycle(selectedCycle, config);

  // Accounting Data Package
  const accountingData = useMemo(() => ({
    config,
    students,
    staff,
  }), [config, students, staff]);

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

  // Preview HTML for Modal
  const modalPreviewHtml = useMemo(() => {
    if (!activePreviewDoc) return '';
    if (activePreviewDoc === 'bilan') return generateBilanHtml(accountingData, false);
    if (activePreviewDoc === 'resultat') return generateCompteResultatHtml(accountingData, false);
    if (activePreviewDoc === 'journal') return generateLivreJournalHtml(accountingData, false);
    if (activePreviewDoc === 'balance') return generateBalanceComptesHtml(accountingData, false);
    return '';
  }, [activePreviewDoc, accountingData]);

  return (
    <div className="space-y-6">
      {/* STRATEGIC ACCOUNTING ACTION BUTTONS PANEL */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-2 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Génération Stratégique & Conformité SYSCOHADA</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Documents Comptables & Bilans Financiers (1-Clic)
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Téléchargez et imprimez instantanément vos états financiers officiels prêts pour audits, conseils d'administration et déclarations administratives.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => printAccountingDocument('bilan', accountingData)}
              className="px-4 py-2.5 rounded-2xl bg-[#0071E3] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer Tout en PDF</span>
            </button>
          </div>
        </div>

        {/* 4 STRATEGIC BUTTON CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
          {/* 1. BILAN COMPTABLE */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-blue-400/40 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-blue-300">Actif / Passif</span>
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-bold text-sm text-white">Bilan Comptable</h3>
              <p className="text-[11px] text-slate-300 mt-1">
                Patrimoine, créances élèves, immobilisations et capitaux propres.
              </p>
            </div>

            <div className="flex items-center gap-1.5 pt-2 border-t border-white/10">
              <button
                onClick={() => printAccountingDocument('bilan', accountingData)}
                className="flex-1 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Générer & Imprimer PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF (1-Clic)</span>
              </button>
              <button
                onClick={() => setActivePreviewDoc('bilan')}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] transition-colors cursor-pointer"
                title="Aperçu Rapide"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => downloadAccountingCSV('bilan', accountingData)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-emerald-300 rounded-xl text-[11px] transition-colors cursor-pointer"
                title="Télécharger Excel / CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. COMPTE DE RÉSULTAT */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-emerald-400/40 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-300">P&L (Produits & Charges)</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-bold text-sm text-white">Compte de Résultat</h3>
              <p className="text-[11px] text-slate-300 mt-1">
                Excédent net, scolarités perçues vs masse salariale et charges.
              </p>
            </div>

            <div className="flex items-center gap-1.5 pt-2 border-t border-white/10">
              <button
                onClick={() => printAccountingDocument('resultat', accountingData)}
                className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Générer & Imprimer PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF (1-Clic)</span>
              </button>
              <button
                onClick={() => setActivePreviewDoc('resultat')}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] transition-colors cursor-pointer"
                title="Aperçu Rapide"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => downloadAccountingCSV('resultat', accountingData)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-emerald-300 rounded-xl text-[11px] transition-colors cursor-pointer"
                title="Télécharger Excel / CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. LIVRE JOURNAL DES ENCAISSEMENTS */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-300">Journal Chronologique</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-bold text-sm text-white">Livre Journal</h3>
              <p className="text-[11px] text-slate-300 mt-1">
                Registre chronologique des reçus, paiements et règlements.
              </p>
            </div>

            <div className="flex items-center gap-1.5 pt-2 border-t border-white/10">
              <button
                onClick={() => printAccountingDocument('journal', accountingData)}
                className="flex-1 py-1.5 px-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Générer & Imprimer PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF (1-Clic)</span>
              </button>
              <button
                onClick={() => setActivePreviewDoc('journal')}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] transition-colors cursor-pointer"
                title="Aperçu Rapide"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => downloadAccountingCSV('journal', accountingData)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-emerald-300 rounded-xl text-[11px] transition-colors cursor-pointer"
                title="Télécharger Excel / CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4. BALANCE DES COMPTES */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-purple-400/40 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-purple-300">SYSCOHADA Classe 4-7</span>
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-bold text-sm text-white">Balance Général</h3>
              <p className="text-[11px] text-slate-300 mt-1">
                Balance générale équilibrée des comptes (Caisse, Banque, Scolarités).
              </p>
            </div>

            <div className="flex items-center gap-1.5 pt-2 border-t border-white/10">
              <button
                onClick={() => printAccountingDocument('balance', accountingData)}
                className="flex-1 py-1.5 px-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Générer & Imprimer PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF (1-Clic)</span>
              </button>
              <button
                onClick={() => setActivePreviewDoc('balance')}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] transition-colors cursor-pointer"
                title="Aperçu Rapide"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => downloadAccountingCSV('balance', accountingData)}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-emerald-300 rounded-xl text-[11px] transition-colors cursor-pointer"
                title="Télécharger Excel / CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

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

      {/* QUICK PREVIEW MODAL FOR ACCOUNTING DOCUMENTS */}
      {activePreviewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-[#151D2E] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-[#222F46]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#222F46] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#0B0F19]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-[#0071E3] flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Aperçu du Document Comptable
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Conforme aux normes SYSCOHADA Établissements Scolaires
                  </p>
                </div>
              </div>

              {/* Document Type Selector Tabs */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-200/70 dark:bg-[#1E293B] p-1 rounded-2xl text-xs">
                <button
                  onClick={() => setActivePreviewDoc('bilan')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    activePreviewDoc === 'bilan'
                      ? 'bg-white dark:bg-[#0071E3] text-[#0071E3] dark:text-white shadow-xs'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
                  }`}
                >
                  Bilan
                </button>
                <button
                  onClick={() => setActivePreviewDoc('resultat')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    activePreviewDoc === 'resultat'
                      ? 'bg-white dark:bg-[#0071E3] text-[#0071E3] dark:text-white shadow-xs'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
                  }`}
                >
                  P&L
                </button>
                <button
                  onClick={() => setActivePreviewDoc('journal')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    activePreviewDoc === 'journal'
                      ? 'bg-white dark:bg-[#0071E3] text-[#0071E3] dark:text-white shadow-xs'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
                  }`}
                >
                  Livre Journal
                </button>
                <button
                  onClick={() => setActivePreviewDoc('balance')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    activePreviewDoc === 'balance'
                      ? 'bg-white dark:bg-[#0071E3] text-[#0071E3] dark:text-white shadow-xs'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A]'
                  }`}
                >
                  Balance
                </button>
              </div>

              <button
                onClick={() => setActivePreviewDoc(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Iframe Render */}
            <div className="flex-1 p-4 bg-slate-100 dark:bg-[#0B0F19] overflow-auto">
              <iframe
                srcDoc={modalPreviewHtml}
                title="Aperçu Document Comptable"
                className="w-full min-h-[520px] bg-white rounded-2xl shadow-md border-0"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-[#222F46] bg-white dark:bg-[#151D2E] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
                <span>Format A4 Prêt à l'Impression / Sauvegarde PDF</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => downloadAccountingCSV(activePreviewDoc, accountingData)}
                  className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-[#222F46] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Exporter CSV / Excel</span>
                </button>

                <button
                  onClick={() => openAccountingDocumentInNewTab(activePreviewDoc, accountingData)}
                  className="px-4 py-2 rounded-2xl border border-blue-200 dark:border-blue-900 text-[#0071E3] dark:text-[#38BDF8] hover:bg-blue-50 dark:hover:bg-blue-900/30 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Ouvrir Nouvel Onglet</span>
                </button>

                <button
                  onClick={() => printAccountingDocument(activePreviewDoc, accountingData)}
                  className="px-5 py-2 rounded-2xl bg-[#0071E3] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer en PDF (1-Clic)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
