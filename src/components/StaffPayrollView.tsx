import React, { useState } from 'react';
import { StaffMember, SchoolConfig } from '../types';
import { formatFCFA } from '../utils/formatters';
import { 
  Users2, 
  Plus, 
  Wallet, 
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface StaffPayrollViewProps {
  config: SchoolConfig;
  staff: StaffMember[];
  onAddNewStaff: (newStaff: StaffMember) => void;
}

export const StaffPayrollView: React.FC<StaffPayrollViewProps> = ({
  config,
  staff,
  onAddNewStaff,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<any>('Enseignant');
  const [contractType, setContractType] = useState<'CDI' | 'CDD'>('CDI');
  const [monthlySalary, setMonthlySalary] = useState<number>(90000);
  const [assigned, setAssigned] = useState('');
  const [phone, setPhone] = useState('066000000');

  const totalPayroll = staff.reduce((acc, s) => acc + s.monthlySalary, 0);
  const cashGap = config.availableBankCash - totalPayroll;
  const isDeficit = cashGap < 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const newMember: StaffMember = {
      id: `stf-${Date.now()}`,
      name,
      role,
      contractType,
      monthlySalary: Number(monthlySalary),
      assignedGradeOrSubject: assigned || 'Enseignement général',
      phone,
      hireDate: new Date().toISOString().split('T')[0],
      status: 'Actif',
    };
    onAddNewStaff(newMember);
    setShowAddForm(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Masse Salariale & Collaborateurs
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            Pilotage des salaires incompressibles (730 000 FCFA/mois) et contrats du personnel
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Collaborateur</span>
        </button>
      </div>

      {/* Metric Cards (Soft UI) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] shadow-sm">
          <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] block">Masse Salariale Mensuelle</span>
          <div className="text-2xl font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC] tracking-tight mt-1">
            {formatFCFA(totalPayroll)}
          </div>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">
            {staff.length} collaborateurs sous contrat
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] shadow-sm">
          <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] block">Trésorerie Disponible</span>
          <div className="text-2xl font-bold font-mono text-[#0071E3] dark:text-[#38BDF8] tracking-tight mt-1">
            {formatFCFA(config.availableBankCash)}
          </div>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 block">
            Solde bancaire actuel
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#151D2E] border border-slate-200/80 dark:border-[#222F46] shadow-sm">
          <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] block">Couverture de Paie</span>
          <div className={`text-2xl font-bold font-mono tracking-tight mt-1 ${isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {Math.round((config.availableBankCash / totalPayroll) * 100)}%
          </div>
          <span className={`text-[11px] font-semibold block mt-1 ${isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {isDeficit ? `Écart : ${formatFCFA(Math.abs(cashGap))}` : 'Paie provisionnée'}
          </span>
        </div>
      </div>

      {/* Form modal or inline */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="p-5 sm:p-6 bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-md space-y-4 text-xs animate-in fade-in zoom-in-95 duration-200">
          <h4 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">Nouveau Collaborateur</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">Nom complet :</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">Rôle :</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              >
                <option value="Enseignant">Enseignant</option>
                <option value="Comptable">Comptable</option>
                <option value="Directeur">Directeur</option>
                <option value="Surveillant Général">Surveillant Général</option>
                <option value="Secrétaire">Secrétaire</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">Type Contrat :</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as any)}
                className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">Salaire Net (FCFA) :</label>
              <input
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(Number(e.target.value))}
                className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">Affectation / Matière :</label>
              <input
                type="text"
                value={assigned}
                onChange={(e) => setAssigned(e.target.value)}
                placeholder="ex: CE2 ou Mathématiques"
                className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
            <div>
              <label className="block font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">Téléphone (+242) :</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#222F46] rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-2xl border border-slate-200/80 dark:border-[#222F46] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold rounded-2xl shadow-xs transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Staff Table */}
      <div className="bg-white dark:bg-[#151D2E] rounded-3xl border border-slate-200/80 dark:border-[#222F46] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-[#222F46] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
            Registre des Collaborateurs
          </h3>
          <span className="text-xs font-mono font-semibold text-[#64748B] dark:text-[#94A3B8]">
            Total fixe : {formatFCFA(totalPayroll)} / mois
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] font-semibold border-b border-slate-200/80 dark:border-[#222F46]">
              <tr>
                <th className="py-3 px-4">Collaborateur</th>
                <th className="py-3 px-4">Fonction</th>
                <th className="py-3 px-4">Contrat</th>
                <th className="py-3 px-4">Affectation</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 font-mono text-right">Salaire Mensuel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-[#222F46]/60 text-[#0F172A] dark:text-[#F8FAFC]">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#0F172A] dark:text-[#F8FAFC]">{s.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full font-semibold bg-blue-50 dark:bg-blue-900/30 text-[#0071E3] dark:text-[#38BDF8] text-[11px]">
                      {s.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]">
                      {s.contractType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B] dark:text-[#94A3B8] font-medium">{s.assignedGradeOrSubject}</td>
                  <td className="py-3.5 px-4 font-mono text-[#64748B] dark:text-[#94A3B8]">+{config.countryCode.replace('+', '')} {s.phone}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-[#0F172A] dark:text-[#F8FAFC]">
                    {formatFCFA(s.monthlySalary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
