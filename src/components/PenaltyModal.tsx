import React, { useState } from 'react';
import { Student, PenaltyRecord, PenaltyType } from '../types';
import { formatFCFA } from '../utils/formatters';
import { 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Scale, 
  UserCheck, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

interface PenaltyModalProps {
  student: Student;
  onClose: () => void;
  onApplyPenalty: (studentId: string, penalty: PenaltyRecord) => void;
  onRemovePenalty: (studentId: string, penaltyId: string, cancelReason?: string) => void;
}

const QUICK_REASONS = [
  { label: 'Retard de paiement de scolarité', type: 'retard' as PenaltyType, defaultAmount: 5000, defaultPoints: 0 },
  { label: 'Dégradation de matériel didactique / mobilier', type: 'financiere' as PenaltyType, defaultAmount: 10000, defaultPoints: 2 },
  { label: 'Absences ou retards répétés sans justificatif', type: 'disciplinaire' as PenaltyType, defaultAmount: 0, defaultPoints: 2 },
  { label: 'Non-respect de l\'uniforme scolaire réglementaire', type: 'disciplinaire' as PenaltyType, defaultAmount: 0, defaultPoints: 1 },
  { label: 'Perturbation de cours / Manque de respect', type: 'disciplinaire' as PenaltyType, defaultAmount: 0, defaultPoints: 3 },
  { label: 'Usage d\'appareil interdit en classe', type: 'disciplinaire' as PenaltyType, defaultAmount: 2000, defaultPoints: 2 },
];

export const PenaltyModal: React.FC<PenaltyModalProps> = ({
  student,
  onClose,
  onApplyPenalty,
  onRemovePenalty,
}) => {
  const [activeTab, setActiveTab] = useState<'give' | 'list'>('give');

  // Form State for giving penalty
  const [penaltyType, setPenaltyType] = useState<PenaltyType>('financiere');
  const [amount, setAmount] = useState<number>(5000);
  const [pointsDeducted, setPointsDeducted] = useState<number>(1);
  const [reason, setReason] = useState<string>('Retard de paiement de scolarité');
  const [recordedBy, setRecordedBy] = useState<string>('Surveillant Général');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Cancellation State
  const [selectedPenaltyToCancel, setSelectedPenaltyToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Régularisation effectuée');

  const penalties = student.penalties || [];
  const activePenalties = penalties.filter((p) => p.status === 'active');
  const cancelledPenalties = penalties.filter((p) => p.status === 'annulee');

  const totalFinancialPenalties = activePenalties.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalConductDeducted = activePenalties.reduce((sum, p) => sum + (p.pointsDeducted || 0), 0);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSubmitNewPenalty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const newPenalty: PenaltyRecord = {
      id: `pen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toISOString().split('T')[0],
      type: penaltyType,
      amount: penaltyType === 'disciplinaire' ? 0 : Number(amount) || 0,
      pointsDeducted: penaltyType === 'financiere' ? 0 : Number(pointsDeducted) || 0,
      reason: reason.trim(),
      recordedBy: recordedBy || 'Direction',
      status: 'active',
    };

    onApplyPenalty(student.id, newPenalty);
    showToast(`Pénalité appliquée avec succès à ${student.firstName} !`);
    setActiveTab('list');
  };

  const handleConfirmCancelPenalty = (penaltyId: string) => {
    onRemovePenalty(student.id, penaltyId, cancelReason);
    setSelectedPenaltyToCancel(null);
    showToast('Pénalité retirée et solde / note recalculés avec succès !');
  };

  const handleSelectQuickReason = (item: typeof QUICK_REASONS[0]) => {
    setReason(item.label);
    setPenaltyType(item.type);
    if (item.defaultAmount > 0) setAmount(item.defaultAmount);
    if (item.defaultPoints > 0) setPointsDeducted(item.defaultPoints);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-[#151D2E] rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-2xl border border-slate-200/80 dark:border-[#222F46] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 dark:border-[#222F46] flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#111827]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#0F172A] dark:text-[#F8FAFC]">
                  Pénalités & Sanctions
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-[#222F46] text-[#0F172A] dark:text-[#F8FAFC]">
                  {student.classLevel} • {student.cycle}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Élève : <strong>{student.firstName} {student.lastName}</strong> (Matricule {student.matricule})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Student Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 sm:px-6 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-[#222F46] text-xs">
          <div className="p-2 rounded-xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46]">
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Pénalités Financières</span>
            <strong className={`font-mono font-bold ${totalFinancialPenalties > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              +{formatFCFA(totalFinancialPenalties)}
            </strong>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46]">
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Déduction Conduite</span>
            <strong className={`font-mono font-bold ${totalConductDeducted > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              -{totalConductDeducted} pt{totalConductDeducted > 1 ? 's' : ''} (Note: {student.conductScore}/20)
            </strong>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46]">
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Solde Actuel Dû</span>
            <strong className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {formatFCFA(student.balanceRemaining)}
            </strong>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46]">
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Pénalités Actives</span>
            <strong className="font-bold text-rose-600 dark:text-rose-400">
              {activePenalties.length} sanction{activePenalties.length > 1 ? 's' : ''}
            </strong>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200/80 dark:border-[#222F46] px-5 sm:px-6 shrink-0 bg-white dark:bg-[#151D2E]">
          <button
            onClick={() => setActiveTab('give')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'give'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Donner une Pénalité</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'list'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Pénalités de l'Élève & Retrait ({activePenalties.length})</span>
          </button>
        </div>

        {/* Toast Notification */}
        {successToast && (
          <div className="mx-5 sm:mx-6 mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* TAB 1: GIVE PENALTY */}
          {activeTab === 'give' && (
            <form onSubmit={handleSubmitNewPenalty} className="space-y-4">
              
              {/* Type Selection */}
              <div>
                <label className="block font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  Type de Sanction / Pénalité
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPenaltyType('financiere');
                      if (amount === 0) setAmount(5000);
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      penaltyType === 'financiere'
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 shadow-xs ring-1 ring-rose-500'
                        : 'border-slate-200/80 dark:border-[#222F46] bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">Pénalité Financière</span>
                      <DollarSign className="w-4 h-4 text-rose-500" />
                    </div>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      Ajout de frais au solde de scolarité
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPenaltyType('disciplinaire');
                      if (pointsDeducted === 0) setPointsDeducted(2);
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      penaltyType === 'disciplinaire'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-950 dark:text-amber-200 shadow-xs ring-1 ring-amber-500'
                        : 'border-slate-200/80 dark:border-[#222F46] bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">Sanction Vie Scolaire</span>
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      Retrait de points sur la note de conduite
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPenaltyType('retard');
                      if (amount === 0) setAmount(5000);
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      penaltyType === 'retard'
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-950 dark:text-blue-200 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200/80 dark:border-[#222F46] bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">Majoration Retard</span>
                      <Clock className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      Pénalité automatique de retard de paiement
                    </span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Motifs */}
              <div>
                <label className="block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                  Motifs Fréquents (Congo Brazzaville)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REASONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuickReason(item)}
                      className="px-2.5 py-1 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] hover:border-rose-400 text-[11px] text-[#0F172A] dark:text-[#F8FAFC] transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-rose-500" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount / Points Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {penaltyType !== 'disciplinaire' && (
                  <div>
                    <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                      Montant de la pénalité (FCFA)
                    </label>
                    <input
                      type="number"
                      min={500}
                      step={500}
                      value={amount}
                      onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                      required
                      className="w-full p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] font-mono font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <div className="flex gap-1.5 mt-1.5">
                      {[2000, 5000, 10000, 15000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val)}
                          className="px-2 py-0.5 rounded-lg bg-slate-200/70 dark:bg-[#1E293B] text-[10px] font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-rose-100 dark:hover:bg-rose-900/30"
                        >
                          +{val / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {penaltyType === 'disciplinaire' && (
                  <div>
                    <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                      Points de conduite à retirer (/20)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={pointsDeducted}
                      onChange={(e) => setPointsDeducted(Math.max(1, Math.min(10, Number(e.target.value))))}
                      required
                      className="w-full p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] font-mono font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex gap-1.5 mt-1.5">
                      {[1, 2, 3, 5].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setPointsDeducted(pts)}
                          className="px-2 py-0.5 rounded-lg bg-slate-200/70 dark:bg-[#1E293B] text-[10px] font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-amber-100 dark:hover:bg-amber-900/30"
                        >
                          -{pts} pt{pts > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Autorité / Responsable
                  </label>
                  <select
                    value={recordedBy}
                    onChange={(e) => setRecordedBy(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Surveillant Général">Surveillant Général (Discipline)</option>
                    <option value="Comptabilité & Caisse">Service Comptabilité (Finances)</option>
                    <option value="Direction des Études">Direction des Études (Pédagogie)</option>
                    <option value="Directeur d'Établissement">Directeur Général (Direction)</option>
                  </select>
                </div>
              </div>

              {/* Reason Description */}
              <div>
                <label className="block font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Justification détaillée du motif
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Retard de paiement du mois de Novembre, détérioration constatée..."
                  required
                  className="w-full p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Appliquer la Pénalité à l'Élève</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ACTIVE & CANCELLED PENALTIES LIST (WITH REMOVAL) */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {activePenalties.length === 0 && cancelledPenalties.length === 0 ? (
                <div className="p-8 text-center bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#222F46]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">Aucune pénalité enregistrée</p>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                    Cet élève n'a aucune sanction financière ou disciplinaire en cours.
                  </p>
                  <button
                    onClick={() => setActiveTab('give')}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Donner une première pénalité</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Active Penalties Section */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        Pénalités Actives ({activePenalties.length})
                      </span>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        Cliquez sur "Retirer" pour annuler une sanction
                      </span>
                    </div>

                    {activePenalties.length === 0 ? (
                      <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs">
                        Toutes les pénalités ont été régularisées ou retirées.
                      </div>
                    ) : (
                      activePenalties.map((penalty) => (
                        <div
                          key={penalty.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#151D2E] border border-rose-200 dark:border-rose-900/50 shadow-xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  penalty.type === 'financiere'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                                    : penalty.type === 'retard'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                }`}>
                                  {penalty.type === 'financiere' ? 'Pénalité Financière' : penalty.type === 'retard' ? 'Majoration Retard' : 'Sanction Disciplinaire'}
                                </span>
                                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                  Le {penalty.date}
                                </span>
                              </div>
                              <p className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">
                                {penalty.reason}
                              </p>
                              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                                Notifié par : <strong>{penalty.recordedBy}</strong>
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              {penalty.amount > 0 && (
                                <div className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                                  +{formatFCFA(penalty.amount)}
                                </div>
                              )}
                              {penalty.pointsDeducted > 0 && (
                                <div className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                                  -{penalty.pointsDeducted} pt de conduite
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedPenaltyToCancel(penalty.id)}
                                className="mt-2 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold flex items-center gap-1 transition-colors ml-auto"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Retirer</span>
                              </button>
                            </div>
                          </div>

                          {/* Inline Confirmation for Cancellation */}
                          {selectedPenaltyToCancel === penalty.id && (
                            <div className="mt-2 p-3 bg-rose-50/70 dark:bg-rose-950/40 rounded-xl border border-rose-300 dark:border-rose-800 space-y-2 animate-in fade-in duration-150">
                              <p className="font-bold text-xs text-rose-800 dark:text-rose-300">
                                Confirmer le retrait de cette pénalité ?
                              </p>
                              <p className="text-[11px] text-rose-700 dark:text-rose-300/90">
                                Le solde dû sera automatiquement réajusté de -{formatFCFA(penalty.amount || 0)} et/ou les points de conduite seront restitués.
                              </p>
                              <div>
                                <label className="block text-[10px] font-semibold text-rose-800 dark:text-rose-300 mb-1">
                                  Motif du retrait / annulation :
                                </label>
                                <input
                                  type="text"
                                  value={cancelReason}
                                  onChange={(e) => setCancelReason(e.target.value)}
                                  placeholder="Ex: Régularisation effectuée, grâce directoriale, erreur..."
                                  className="w-full p-1.5 rounded-lg bg-white dark:bg-[#151D2E] border border-rose-300 dark:border-rose-700 text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                                />
                              </div>
                              <div className="flex gap-2 justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedPenaltyToCancel(null)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-[#1E293B] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]"
                                >
                                  Annuler
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmCancelPenalty(penalty.id)}
                                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Confirmer le Retrait</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Cancelled / Removed Penalties History */}
                  {cancelledPenalties.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-slate-200/80 dark:border-[#222F46]">
                      <span className="font-bold text-xs text-[#64748B] dark:text-[#94A3B8] block">
                        Historique des Pénalités Retirées ({cancelledPenalties.length})
                      </span>

                      {cancelledPenalties.map((penalty) => (
                        <div
                          key={penalty.id}
                          className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/60 dark:border-[#222F46]/60 opacity-70 line-through-container text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="line-through font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                              {penalty.reason} ({penalty.amount > 0 ? formatFCFA(penalty.amount) : `${penalty.pointsDeducted} pts`})
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold no-underline">
                              Retirée le {penalty.cancelledAt || 'récemment'}
                            </span>
                          </div>
                          {penalty.cancelReason && (
                            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] italic no-underline">
                              Motif du retrait : {penalty.cancelReason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#0F172A] border-t border-slate-200/80 dark:border-[#222F46] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>Toute pénalité financière impacte immédiatement le solde dû officiel.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200/80 dark:bg-[#1E293B] hover:bg-slate-300 dark:hover:bg-[#2A374F] text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
