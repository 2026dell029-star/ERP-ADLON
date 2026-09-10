import React, { useState } from 'react';
import { Student, PaymentMethod, PaymentRecord } from '../types';
import { formatFCFA } from '../utils/formatters';
import { CreditCard, X, Check, Printer } from 'lucide-react';

interface PaymentModalProps {
  student: Student;
  onClose: () => void;
  onRecordPayment: (studentId: string, payment: PaymentRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  student,
  onClose,
  onRecordPayment,
}) => {
  const [amount, setAmount] = useState<number>(Math.min(student.balanceRemaining, 50000) || 20000);
  const [method, setMethod] = useState<PaymentMethod>('Airtel Money');
  const [note, setNote] = useState<string>('Versement scolarité');
  const [cashierName, setCashierName] = useState<string>('Mme Makosso (Comptable)');
  const [generatedReceipt, setGeneratedReceipt] = useState<PaymentRecord | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const receiptNum = `REC-2026-${new Date().getMonth() + 1}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: Number(amount),
      method,
      receiptNumber: receiptNum,
      cashierName,
      note,
    };

    onRecordPayment(student.id, newPayment);
    setGeneratedReceipt(newPayment);
  };

  const remainingAfterPayment = Math.max(0, student.balanceRemaining - (generatedReceipt ? 0 : amount));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white dark:bg-[#151D2E] rounded-3xl max-w-lg w-full my-2 sm:my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col shadow-2xl border border-slate-200/80 dark:border-[#222F46] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 dark:border-[#222F46] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base text-[#0F172A] dark:text-[#F8FAFC]">Encaisser un Paiement</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Élève : {student.firstName} {student.lastName} ({student.classLevel})
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generated Receipt View */}
        {generatedReceipt ? (
          <div className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto overscroll-contain flex-1">
            <div className="p-4 sm:p-5 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#222F46] space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-[#222F46] pb-2.5">
                <div>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase block font-semibold tracking-wider">Quittance Officielle</span>
                  <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">{generatedReceipt.receiptNumber}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  Encaissé
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-[#0F172A] dark:text-[#F8FAFC]">
                <div>
                  <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Élève :</span>
                  <strong className="font-bold">{student.firstName} {student.lastName}</strong>
                </div>
                <div>
                  <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Montant perçu :</span>
                  <strong className="text-sm font-mono text-[#0071E3] dark:text-[#38BDF8] font-bold">{formatFCFA(generatedReceipt.amount)}</strong>
                </div>
                <div>
                  <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Canal :</span>
                  <span className="font-medium">{generatedReceipt.method}</span>
                </div>
                <div>
                  <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Caissier :</span>
                  <span className="font-medium">{generatedReceipt.cashierName}</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200/80 dark:border-[#222F46] flex justify-between items-center text-xs">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Nouveau solde restant dû :</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{formatFCFA(remainingAfterPayment)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 px-3 rounded-2xl border border-slate-200/80 dark:border-[#222F46] text-[#0F172A] dark:text-[#F8FAFC] font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le reçu</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Terminer</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto overscroll-contain flex-1">
            {/* Student balance header */}
            <div className="p-3.5 sm:p-4 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-[#222F46] flex justify-between items-center">
              <div>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">Reste dû sur l'année :</span>
                <span className="text-base font-mono font-bold text-rose-600 dark:text-rose-400">
                  {formatFCFA(student.balanceRemaining)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">Après encaissement :</span>
                <span className="text-base font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {formatFCFA(remainingAfterPayment)}
                </span>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">
                Montant encaissé (FCFA) :
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                max={student.balanceRemaining}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl font-mono text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                required
              />
            </div>

            {/* Payment method */}
            <div>
              <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">Mode de règlement :</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Airtel Money', 'MTN Mobile Money', 'Espèces', 'Virement'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`p-2.5 rounded-2xl border text-xs font-semibold text-left transition-all ${
                      method === m
                        ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs'
                        : 'bg-white dark:bg-[#151D2E] text-[#0F172A] dark:text-[#F8FAFC] border-slate-200/80 dark:border-[#222F46] hover:bg-slate-50 dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1.5">Motif / Tranche :</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-end gap-2 border-t border-slate-200/80 dark:border-[#222F46]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-[#222F46] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-2xl shadow-xs transition-colors"
              >
                Valider et Générer la Quittance
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
