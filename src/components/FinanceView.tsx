import React, { useState, useMemo } from 'react';
import { SchoolConfig, Student, StaffMember, CashTransaction, CashTransactionType, PaymentMethod } from '../types';
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
  ArrowDownRight,
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
  Sparkles,
  PlusCircle,
  MinusCircle,
  Trash2,
  Filter,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Tag,
  User
} from 'lucide-react';

interface FinanceViewProps {
  config: SchoolConfig;
  students: Student[];
  staff?: StaffMember[];
  cashTransactions?: CashTransaction[];
  onAddCashTransaction?: (transaction: CashTransaction) => void;
  onDeleteCashTransaction?: (id: string) => void;
  onOpenPayment: (student: Student) => void;
  onOpenStudentDetail: (student: Student) => void;
  onOpenWhatsApp: (student: Student) => void;
  onAddNewStudent?: (newStudent: Student) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  config,
  students,
  staff = [],
  cashTransactions = [],
  onAddCashTransaction,
  onDeleteCashTransaction,
  onOpenPayment,
  onOpenStudentDetail,
  onOpenWhatsApp,
}) => {
  // Navigation sub-tabs inside Finance
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'tuition' | 'cash_ledger'>('overview');

  // Filters for tuition table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filters for Cash Transactions Ledger
  const [cashFilterType, setCashFilterType] = useState<'all' | 'encaissement' | 'decaissement'>('all');
  const [cashSearchTerm, setCashSearchTerm] = useState('');

  // Preview Modal State for Accounting Docs
  const [activePreviewDoc, setActivePreviewDoc] = useState<AccountingDocumentType | null>(null);

  // Modals state for Cash Operations
  const [isEncaissementModalOpen, setIsEncaissementModalOpen] = useState(false);
  const [isDecaissementModalOpen, setIsDecaissementModalOpen] = useState(false);

  // Form State for Encaissement Extra-Scolaire
  const [encReason, setEncReason] = useState('');
  const [encAmount, setEncAmount] = useState<string>('');
  const [encCategory, setEncCategory] = useState("Vente d'uniformes & tenues");
  const [encMethod, setEncMethod] = useState<PaymentMethod>('Espèces');
  const [encThirdParty, setEncThirdParty] = useState('');
  const [encDate, setEncDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [encError, setEncError] = useState<string | null>(null);

  // Form State for Décaissement (Sortie)
  const [decReason, setDecReason] = useState('');
  const [decAmount, setDecAmount] = useState<string>('');
  const [decCategory, setDecCategory] = useState("Achat de fournitures & papier");
  const [decMethod, setDecMethod] = useState<PaymentMethod>('Espèces');
  const [decThirdParty, setDecThirdParty] = useState('');
  const [decDate, setDecDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [decError, setDecError] = useState<string | null>(null);

  const availableClassesForCycle = getClassesForCycle(selectedCycle, config);

  // Accounting Data Package
  const accountingData = useMemo(() => ({
    config,
    students,
    staff,
    cashTransactions,
  }), [config, students, staff, cashTransactions]);

  // Financial aggregates computed from real student payments + cash operations
  const totalBilled = useMemo(() => {
    return students.reduce((sum, s) => sum + (s.totalDue || 0), 0);
  }, [students]);

  const totalCollectedTuition = useMemo(() => {
    return students.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
  }, [students]);

  const totalExtraEncaissements = useMemo(() => {
    return cashTransactions
      .filter((t) => t.type === 'encaissement')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [cashTransactions]);

  const totalDecaissements = useMemo(() => {
    return cashTransactions
      .filter((t) => t.type === 'decaissement')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [cashTransactions]);

  // Overall Financial Totals
  const totalEntrees = useMemo(() => {
    return totalCollectedTuition + totalExtraEncaissements;
  }, [totalCollectedTuition, totalExtraEncaissements]);

  const totalSorties = useMemo(() => {
    return totalDecaissements;
  }, [totalDecaissements]);

  const soldeCaisse = useMemo(() => {
    return totalEntrees - totalSorties;
  }, [totalEntrees, totalSorties]);

  const totalRemaining = useMemo(() => {
    return students.reduce((sum, s) => sum + (s.balanceRemaining || 0), 0);
  }, [students]);

  const recoveryRate = useMemo(() => {
    if (totalBilled <= 0) return 0;
    return Math.round((totalCollectedTuition / totalBilled) * 100);
  }, [totalBilled, totalCollectedTuition]);

  // Chronological list of all cash payments (Scolarités + Extra + Décaissements)
  const combinedCashLedger = useMemo(() => {
    const list: {
      id: string;
      date: string;
      type: 'scolarite' | 'extra_encaissement' | 'decaissement';
      title: string;
      category: string;
      amount: number;
      method: string;
      thirdParty?: string;
      registeredBy?: string;
      refNumber: string;
      originalCashTxId?: string;
    }[] = [];

    // 1. Student payments
    students.forEach((s) => {
      (s.payments || []).forEach((p, idx) => {
        list.push({
          id: p.id,
          date: p.date,
          type: 'scolarite',
          title: `Paiement Scolarité - ${s.firstName} ${s.lastName}`,
          category: `Classe ${s.classLevel}`,
          amount: p.amount,
          method: p.method,
          thirdParty: `Matricule: ${s.matricule}`,
          registeredBy: p.cashierName || 'Caisse Établissement',
          refNumber: p.receiptNumber || `REC-${p.date.replace(/-/g, '')}-${idx + 1}`,
        });
      });
    });

    // 2. Extra cash transactions
    cashTransactions.forEach((t) => {
      list.push({
        id: t.id,
        date: t.date,
        type: t.type === 'encaissement' ? 'extra_encaissement' : 'decaissement',
        title: t.reason,
        category: t.category,
        amount: t.type === 'decaissement' ? -t.amount : t.amount,
        method: t.paymentMethod,
        thirdParty: t.thirdPartyName,
        registeredBy: t.registeredBy,
        refNumber: t.receiptNumber || `CASH-${t.date.replace(/-/g, '')}`,
        originalCashTxId: t.id,
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [students, cashTransactions]);

  // Filtered Cash Ledger for dedicated tab
  const filteredCashLedger = useMemo(() => {
    return combinedCashLedger.filter((item) => {
      const q = cashSearchTerm.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.thirdParty || '').toLowerCase().includes(q) ||
        item.refNumber.toLowerCase().includes(q);

      if (cashFilterType === 'encaissement') {
        return matchesSearch && (item.type === 'scolarite' || item.type === 'extra_encaissement');
      }
      if (cashFilterType === 'decaissement') {
        return matchesSearch && item.type === 'decaissement';
      }
      return matchesSearch;
    });
  }, [combinedCashLedger, cashFilterType, cashSearchTerm]);

  // Filtered Students for Tuition tab
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

  // Handle Encaissement Submit
  const handleSaveEncaissement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!encReason.trim()) {
      setEncError("Le motif de l'encaissement est obligatoire.");
      return;
    }
    const val = Number(encAmount);
    if (isNaN(val) || val <= 0) {
      setEncError("Le montant doit être un nombre valide supérieur à 0 FCFA.");
      return;
    }

    const newTx: CashTransaction = {
      id: `enc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: encDate || new Date().toISOString().split('T')[0],
      type: 'encaissement',
      category: encCategory,
      reason: encReason.trim(),
      amount: val,
      paymentMethod: encMethod,
      registeredBy: config.directorName || 'Comptabilité / Caisse',
      thirdPartyName: encThirdParty.trim() || undefined,
      receiptNumber: `ENC-${encDate.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    if (onAddCashTransaction) {
      onAddCashTransaction(newTx);
    }

    // Reset & Close
    setEncReason('');
    setEncAmount('');
    setEncThirdParty('');
    setEncError(null);
    setIsEncaissementModalOpen(false);
  };

  // Handle Décaissement Submit
  const handleSaveDecaissement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decReason.trim()) {
      setDecError("Le motif du décaissement est obligatoire.");
      return;
    }
    const val = Number(decAmount);
    if (isNaN(val) || val <= 0) {
      setDecError("Le montant doit être un nombre valide supérieur à 0 FCFA.");
      return;
    }

    const newTx: CashTransaction = {
      id: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: decDate || new Date().toISOString().split('T')[0],
      type: 'decaissement',
      category: decCategory,
      reason: decReason.trim(),
      amount: val,
      paymentMethod: decMethod,
      registeredBy: config.directorName || 'Comptabilité / Caisse',
      thirdPartyName: decThirdParty.trim() || undefined,
      receiptNumber: `DEC-${decDate.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    if (onAddCashTransaction) {
      onAddCashTransaction(newTx);
    }

    // Reset & Close
    setDecReason('');
    setDecAmount('');
    setDecThirdParty('');
    setDecError(null);
    setIsDecaissementModalOpen(false);
  };

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
      {/* 1. TOP CASH & TREASURY BANNER (AUTOMATIC CALCULATIONS) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2 border border-emerald-400/30">
              <Wallet className="w-3.5 h-3.5" />
              <span>Gestion Automatique de Caisse & Trésorerie</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bilan & Trésorerie en Temps Réel
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Calcul automatique de votre montant disponible en caisse, le total des entrées (scolarités et recettes extra-scolaires) et le total des sorties (décaissements).
            </p>
          </div>

          {/* QUICK ACTION BUTTONS: ENCAISSEMENT EXTRA & DÉCAISSEMENT */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setEncError(null);
                setIsEncaissementModalOpen(true);
              }}
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>＋ Encaissement Extra-Scolaire</span>
            </button>

            <button
              onClick={() => {
                setDecError(null);
                setIsDecaissementModalOpen(true);
              }}
              className="px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-900/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <MinusCircle className="w-4 h-4" />
              <span>－ Nouveau Décaissement</span>
            </button>
          </div>
        </div>

        {/* THREE PRIMARY AUTOMATIC TREASURY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 relative z-10">
          {/* A. MONTANT TOTAL EN CAISSE */}
          <div className={`p-5 rounded-2xl border backdrop-blur-md transition-all flex flex-col justify-between ${
            soldeCaisse >= 0 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-white' 
              : 'bg-rose-500/10 border-rose-500/30 text-white'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                  Montant en Caisse (Trésorerie Net)
                </span>
                <div className={`p-2 rounded-xl ${soldeCaisse >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${soldeCaisse >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatFCFA(soldeCaisse)}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <span>Solde disponible calculé</span>
              <span className={`font-semibold ${soldeCaisse >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {soldeCaisse >= 0 ? '✓ Caisse Équilibrée' : '⚠ Déficit de Caisse'}
              </span>
            </div>
          </div>

          {/* B. TOTAL DES ENTRÉES */}
          <div className="p-5 rounded-2xl bg-white/10 border border-white/10 text-white backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-300">
                  Total des Entrées (Cumul)
                </span>
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-blue-300">
                +{formatFCFA(totalEntrees)}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-300">
              <span className="bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-200 font-medium">
                Scolarités: {formatFCFA(totalCollectedTuition)}
              </span>
              <span className="bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-200 font-medium">
                Extras: {formatFCFA(totalExtraEncaissements)}
              </span>
            </div>
          </div>

          {/* C. TOTAL DES SORTIES */}
          <div className="p-5 rounded-2xl bg-white/10 border border-white/10 text-white backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-300">
                  Total des Sorties (Décaissements)
                </span>
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-300">
                -{formatFCFA(totalSorties)}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <span>{cashTransactions.filter(t => t.type === 'decaissement').length} décaissement(s) effectué(s)</span>
              <span className="text-rose-300 font-semibold">Charges d'Exploitation</span>
            </div>
          </div>
        </div>

        {/* STRATEGIC ACCOUNTING PRINT BUTTONS */}
        <div className="mt-6 pt-5 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Documents officiels conformes au plan comptable SYSCOHADA Établissements Scolaires</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePreviewDoc('bilan')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Aperçu Bilan</span>
            </button>
            <button
              onClick={() => printAccountingDocument('bilan', accountingData)}
              className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer États PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SECONDARY KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span className="font-semibold uppercase tracking-wider">Total Scolarité Facturé</span>
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

        {/* Total Collected Tuition */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span className="font-semibold uppercase tracking-wider">Recettes Scolarité</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {formatFCFA(totalCollectedTuition)}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Frais d'études et cantine
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
          <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
            {recoveryRate}%
          </div>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
            Progression des encaissements
          </p>
        </div>
      </div>

      {/* 3. NAVIGATION SUB-TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-[#222F46] pb-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#151D2E] p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'overview'
                ? 'bg-white dark:bg-[#0071E3] text-[#0071E3] dark:text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Aperçu Caisse & Opérations</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tuition')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'tuition'
                ? 'bg-white dark:bg-[#0071E3] text-[#0071E3] dark:text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Recouvrement Scolarités ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cash_ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'cash_ledger'
                ? 'bg-white dark:bg-[#0071E3] text-[#0071E3] dark:text-white shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Journal Caisse Entrées / Sorties ({combinedCashLedger.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEncError(null);
              setIsEncaissementModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-500 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Encaissement Extra</span>
          </button>

          <button
            onClick={() => {
              setDecError(null);
              setIsDecaissementModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-rose-500 transition-all cursor-pointer"
          >
            <MinusCircle className="w-4 h-4" />
            <span>Décaissement</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: OVERVIEW & LIVE CASH LEDGER */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* RECENT CASH OPERATIONS LEDGER */}
          <div className="bg-white dark:bg-[#151D2E] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-[#222F46] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#0071E3]" />
                  <span>Dernières Opérations de Caisse (Entrées & Sorties)</span>
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Journal centralisé de tous les versements de scolarités, encaissements extra-scolaires et décaissements.
                </p>
              </div>

              <button
                onClick={() => setActiveSubTab('cash_ledger')}
                className="text-xs text-[#0071E3] dark:text-[#38BDF8] font-bold hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>Voir le journal complet</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#222F46] text-[#64748B] dark:text-[#94A3B8] font-semibold">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Réf / N° Pièce</th>
                    <th className="py-3 px-3">Type & Catégorie</th>
                    <th className="py-3 px-3">Motif / Désignation</th>
                    <th className="py-3 px-3">Tiers / Élève</th>
                    <th className="py-3 px-3">Mode</th>
                    <th className="py-3 px-3 text-right">Montant FCFA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                  {combinedCashLedger.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Aucune opération de caisse enregistrée. Utilisez les boutons d'encaissement ou décaissement ci-dessus.
                      </td>
                    </tr>
                  ) : (
                    combinedCashLedger.slice(0, 8).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors">
                        <td className="py-3 px-3 font-mono text-[#64748B] dark:text-[#94A3B8]">{item.date}</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#0071E3] dark:text-[#38BDF8]">
                          {item.refNumber}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.type === 'scolarite'
                              ? 'bg-blue-100 dark:bg-blue-950 text-[#0071E3] dark:text-[#38BDF8]'
                              : item.type === 'extra_encaissement'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                          }`}>
                            {item.type === 'scolarite' && 'Scolarité'}
                            {item.type === 'extra_encaissement' && 'Entrée Extra'}
                            {item.type === 'decaissement' && 'Décaissement'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                          {item.title}
                        </td>
                        <td className="py-3 px-3 text-[#64748B] dark:text-[#94A3B8]">
                          {item.thirdParty || '-'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0F172A] text-[10px] font-medium text-slate-700 dark:text-slate-300">
                            {item.method}
                          </span>
                        </td>
                        <td className={`py-3 px-3 font-mono font-black text-right text-sm ${
                          item.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {item.amount >= 0 ? '+' : ''}{formatFCFA(item.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: TUITION COLLECTION TABLE */}
      {activeSubTab === 'tuition' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white dark:bg-[#151D2E] rounded-3xl p-4 border border-slate-200/80 dark:border-[#222F46] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher élève, matricule, parent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs focus:outline-none focus:border-[#0071E3]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCycle}
                onChange={(e) => {
                  setSelectedCycle(e.target.value);
                  setSelectedClass('all');
                }}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs focus:outline-none cursor-pointer"
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
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">Toutes les classes</option>
                {availableClassesForCycle.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="solde">Soldé (100%)</option>
                <option value="partiel">Partiel</option>
                <option value="impaye">Non payé (0%)</option>
              </select>
            </div>
          </div>

          {/* STUDENTS TUITION TABLE */}
          <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#222F46] bg-slate-50 dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] font-bold">
                    <th className="py-3.5 px-4">Élève & Matricule</th>
                    <th className="py-3.5 px-4">Cycle & Classe</th>
                    <th className="py-3.5 px-4 text-right">Total Dû</th>
                    <th className="py-3.5 px-4 text-right">Déjà Payé</th>
                    <th className="py-3.5 px-4 text-right">Reste à Payer</th>
                    <th className="py-3.5 px-4 text-center">Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Aucun élève trouvé selon ces critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => onOpenStudentDetail(student)}
                            className="text-left font-bold text-[#0071E3] dark:text-[#38BDF8] hover:underline block"
                          >
                            {student.firstName} {student.lastName}
                          </button>
                          <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                            {student.matricule}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            {student.classLevel}
                          </span>
                          <span className="block text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                            {student.cycle}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-right text-[#0F172A] dark:text-[#F8FAFC]">
                          {formatFCFA(student.totalDue)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-600 dark:text-emerald-400">
                          {formatFCFA(student.totalPaid)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-right text-rose-600 dark:text-rose-400">
                          {formatFCFA(student.balanceRemaining)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            student.status === 'solde'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : student.status === 'partiel'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {student.status === 'solde' && 'Soldé'}
                            {student.status === 'partiel' && 'Partiel'}
                            {student.status === 'impaye' && 'Non Payé'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenPayment(student)}
                              className="px-3 py-1.5 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              title="Encaisser de la scolarité"
                            >
                              <Wallet className="w-3.5 h-3.5" />
                              <span>Encaisser</span>
                            </button>

                            {student.balanceRemaining > 0 && (
                              <button
                                onClick={() => onOpenWhatsApp(student)}
                                className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 transition-colors cursor-pointer"
                                title="Relance WhatsApp Parent"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: FULL CASH TRANSACTIONS LEDGER */}
      {activeSubTab === 'cash_ledger' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#151D2E] rounded-3xl p-4 border border-slate-200/80 dark:border-[#222F46] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrer par motif, tiers, n° de reçu..."
                value={cashSearchTerm}
                onChange={(e) => setCashSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs focus:outline-none focus:border-[#0071E3]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCashFilterType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  cashFilterType === 'all'
                    ? 'bg-[#0071E3] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-300'
                }`}
              >
                Toutes ({combinedCashLedger.length})
              </button>
              <button
                onClick={() => setCashFilterType('encaissement')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  cashFilterType === 'encaissement'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-300'
                }`}
              >
                Entrées Uniquement
              </button>
              <button
                onClick={() => setCashFilterType('decaissement')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  cashFilterType === 'decaissement'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-300'
                }`}
              >
                Décaissements Uniquement
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#222F46] bg-slate-50 dark:bg-[#0B0F19] text-[#64748B] dark:text-[#94A3B8] font-bold">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">N° Pièce / Reçu</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Motif Obligatoire & Catégorie</th>
                    <th className="py-3.5 px-4">Tiers / Intervenant</th>
                    <th className="py-3.5 px-4">Mode</th>
                    <th className="py-3.5 px-4 text-right">Montant (FCFA)</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]">
                  {filteredCashLedger.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Aucune transaction trouvée dans le journal de caisse.
                      </td>
                    </tr>
                  ) : (
                    filteredCashLedger.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[#64748B] dark:text-[#94A3B8]">{item.date}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#0071E3] dark:text-[#38BDF8]">
                          {item.refNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.type === 'scolarite'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : item.type === 'extra_encaissement'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {item.type === 'scolarite' && 'Scolarité'}
                            {item.type === 'extra_encaissement' && 'Entrée Extra'}
                            {item.type === 'decaissement' && 'Décaissement'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <strong className="block text-[#0F172A] dark:text-[#F8FAFC]">{item.title}</strong>
                          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{item.category}</span>
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B] dark:text-[#94A3B8]">
                          {item.thirdParty || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0F172A] text-[10px] font-medium text-slate-700 dark:text-slate-300">
                            {item.method}
                          </span>
                        </td>
                        <td className={`py-3.5 px-4 font-mono font-black text-right text-sm ${
                          item.amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {item.amount >= 0 ? '+' : ''}{formatFCFA(item.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {item.originalCashTxId && onDeleteCashTransaction && (
                            <button
                              onClick={() => {
                                if (window.confirm('Voulez-vous supprimer cette opération de caisse ? Le solde sera automatiquement recalculé.')) {
                                  onDeleteCashTransaction(item.originalCashTxId!);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Supprimer la transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ENCAISSEMENT EXTRA-SCOLAIRE (ENTRÉE DE CAISSE) */}
      {isEncaissementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-[#151D2E] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-[#222F46] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-[#222F46] bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-300">
                    Nouvel Encaissement Extra-Scolaire
                  </h3>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80">
                    Saisissez une recette hors-scolarité (motif et montant obligatoires)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEncaissementModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEncaissement} className="p-5 space-y-4">
              {encError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{encError}</span>
                </div>
              )}

              {/* MOTIF OBLIGATOIRE */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Motif Obligatoire de l'Encaissement <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Vente de 3 uniformes complets, Location de la salle pour conférence..."
                  value={encReason}
                  onChange={(e) => setEncReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* MONTANT OBLIGATOIRE */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Montant à Encaisser (FCFA) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="500"
                  placeholder="ex: 25000"
                  value={encAmount}
                  onChange={(e) => setEncAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* CATÉGORIE & MODE DE PAIEMENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Catégorie
                  </label>
                  <select
                    value={encCategory}
                    onChange={(e) => setEncCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Vente d'uniformes & tenues">Vente d'uniformes & tenues</option>
                    <option value="Fournitures & manuels scolaires">Fournitures & manuels scolaires</option>
                    <option value="Activités périscolaires & kermesse">Activités périscolaires & kermesse</option>
                    <option value="Cantine exceptionnelle & goûters">Cantine exceptionnelle & goûters</option>
                    <option value="Location de salle / matériel">Location de salle / matériel</option>
                    <option value="Dons, subventions & aides">Dons, subventions & aides</option>
                    <option value="Divers encaissements">Divers encaissements</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Mode de Règlement
                  </label>
                  <select
                    value={encMethod}
                    onChange={(e) => setEncMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Espèces">Espèces (Caisse)</option>
                    <option value="Airtel Money">Airtel Money (+242)</option>
                    <option value="MTN Mobile Money">MTN Mobile Money (+242)</option>
                    <option value="Virement">Virement Bancaire</option>
                  </select>
                </div>
              </div>

              {/* NOM DU TIERS & DATE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Nom du Tiers / Payeur (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: M. Mabiala, Société X..."
                    value={encThirdParty}
                    onChange={(e) => setEncThirdParty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Date de l'Opération
                  </label>
                  <input
                    type="date"
                    value={encDate}
                    onChange={(e) => setEncDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#222F46] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEncaissementModalOpen(false)}
                  className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-[#222F46] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider l'Encaissement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DÉCAISSEMENT (SORTIE DE CAISSE) */}
      {isDecaissementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-[#151D2E] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-[#222F46] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-[#222F46] bg-rose-50 dark:bg-rose-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                  <MinusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-950 dark:text-rose-300">
                    Nouveau Décaissement (Sortie de Caisse)
                  </h3>
                  <p className="text-xs text-rose-800/80 dark:text-rose-400/80">
                    Saisissez une dépense ou sortie de fonds (motif et montant obligatoires)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDecaissementModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDecaissement} className="p-5 space-y-4">
              {decError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{decError}</span>
                </div>
              )}

              {/* MOTIF OBLIGATOIRE */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Motif Obligatoire du Décaissement <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Achat de 10 rames de papier pour examens, Règlement Facture Électricité..."
                  value={decReason}
                  onChange={(e) => setDecReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* MONTANT OBLIGATOIRE */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Montant Décaissé (FCFA) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="500"
                  placeholder="ex: 15000"
                  value={decAmount}
                  onChange={(e) => setDecAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-sm font-mono font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* CATÉGORIE & MODE DE PAIEMENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Catégorie de Dépense
                  </label>
                  <select
                    value={decCategory}
                    onChange={(e) => setDecCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Achat de fournitures & papier">Achat de fournitures & papier</option>
                    <option value="Facture d'eau & électricité (SNEE/E2D)">Facture d'eau & électricité (SNEE/E2D)</option>
                    <option value="Maintenance & travaux locaux">Maintenance & travaux locaux</option>
                    <option value="Carburant & groupes électrogènes">Carburant & groupes électrogènes</option>
                    <option value="Avance sur salaire / personnel">Avance sur salaire / personnel</option>
                    <option value="Frais de réception & événements">Frais de réception & événements</option>
                    <option value="Transport & déplacements">Transport & déplacements</option>
                    <option value="Divers décaissements">Divers décaissements</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Mode de Règlement
                  </label>
                  <select
                    value={decMethod}
                    onChange={(e) => setDecMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Espèces">Espèces (Caisse)</option>
                    <option value="Airtel Money">Airtel Money (+242)</option>
                    <option value="MTN Mobile Money">MTN Mobile Money (+242)</option>
                    <option value="Virement">Virement Bancaire</option>
                  </select>
                </div>
              </div>

              {/* BÉNÉFICIAIRE & DATE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Bénéficiaire / Fournisseur (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Papeterie Centrale, SNEE, M. Okemba..."
                    value={decThirdParty}
                    onChange={(e) => setDecThirdParty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Date du Décaissement
                  </label>
                  <input
                    type="date"
                    value={decDate}
                    onChange={(e) => setDecDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#222F46] text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#222F46] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDecaissementModalOpen(false)}
                  className="px-4 py-2 rounded-2xl border border-slate-300 dark:border-[#222F46] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider le Décaissement</span>
                </button>
              </div>
            </form>
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
