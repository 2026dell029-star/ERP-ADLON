import React, { useState } from 'react';
import { School, SchoolConfig } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  PlusCircle, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Coins, 
  CheckCircle2, 
  LogOut, 
  Sun, 
  Moon, 
  Search, 
  Sparkles, 
  Users,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  Copy,
  Check,
  Code
} from 'lucide-react';

interface SchoolSelectionViewProps {
  schools: School[];
  onSelectSchool: (school: School) => void;
  onCreateSchool: (newSchool: School) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const FIRESTORE_RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

export const SchoolSelectionView: React.FC<SchoolSelectionViewProps> = ({
  schools,
  onSelectSchool,
  onCreateSchool,
  theme,
  onToggleTheme,
}) => {
  const { user, logOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'select' | 'create'>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  // Form state for creating a new school
  const [schoolName, setSchoolName] = useState('');
  const [schoolCity, setSchoolCity] = useState('Brazzaville');
  const [schoolCountry, setSchoolCountry] = useState('Congo');
  const [currency, setCurrency] = useState('FCFA');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [directorName, setDirectorName] = useState('');
  const [schoolMotto, setSchoolMotto] = useState('Discipline - Travail - Succès');

  const copyRules = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES_SNIPPET);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  };

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) return;

    const schoolCode = schoolName
      .trim()
      .split(' ')
      .map((w) => w[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 5) + '-' + Math.floor(100 + Math.random() * 900);

    const schoolId = 'school_' + Date.now();

    const newSchool: School = {
      id: schoolId,
      name: schoolName.trim(),
      code: schoolCode,
      city: schoolCity.trim(),
      country: schoolCountry.trim(),
      currency: currency.trim(),
      academicYear: academicYear.trim(),
      directorName: directorName.trim() || user?.displayName || 'Directeur d\'Établissement',
      motto: schoolMotto.trim(),
      createdAt: new Date().toISOString(),
      createdBy: user?.uid || 'anonymous',
      adminEmails: user?.email ? [user.email] : [],
      studentCount: 0,
    };

    onCreateSchool(newSchool);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0F19] text-[#1D1D1F] dark:text-[#F8FAFC] flex flex-col justify-between transition-colors antialiased">
      {/* Top Header */}
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
              Espace Établissements Scolaires
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
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
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
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Étape 1 sur 2 : Choix de l'Établissement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Sélectionnez ou créez votre école
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] max-w-xl mx-auto mt-2">
            Chaque établissement dispose de sa base d'élèves, de sa trésorerie, de ses grilles de scolarité et de ses bulletins de notes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-md mx-auto w-full grid grid-cols-2 p-1.5 bg-slate-200 dark:bg-[#1E293B] rounded-2xl mb-8 text-xs font-bold shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('select')}
            className={`py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'select'
                ? 'bg-white dark:bg-[#0B0F19] text-blue-600 dark:text-blue-400 shadow-md font-extrabold'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Établissements existants ({schools.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'create'
                ? 'bg-white dark:bg-[#0B0F19] text-blue-600 dark:text-blue-400 shadow-md font-extrabold'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Créer une nouvelle école</span>
          </button>
        </div>

        {/* TAB 1: Select School */}
        {activeTab === 'select' && (
          <div className="space-y-6">
            {schools.length > 3 && (
              <div className="max-w-md mx-auto relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, ville ou code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] rounded-xl text-xs text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSchools.map((school) => (
                <div
                  key={school.id}
                  onClick={() => onSelectSchool(school)}
                  className="group relative bg-white dark:bg-[#111827] border-2 border-slate-200/80 dark:border-[#1E293B] hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-100 dark:border-blue-900/50 group-hover:scale-105 transition-transform">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#1E293B] text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                        {school.code}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {school.name}
                      </h3>
                      {school.motto && (
                        <p className="text-[11px] italic text-[#64748B] dark:text-[#94A3B8] mt-0.5 line-clamp-1">
                          « {school.motto} »
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-[#1E293B] space-y-1.5 text-xs text-[#64748B] dark:text-[#94A3B8]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{school.city}, {school.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Année scolaire : <strong className="text-slate-700 dark:text-slate-300">{school.academicYear}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Devise : <strong className="text-slate-700 dark:text-slate-300">{school.currency}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span>Accéder à l'établissement</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {filteredSchools.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#1E293B] p-8">
                <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Aucun établissement trouvé</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Créez votre première école pour commencer à gérer vos élèves.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Créer une école maintenant</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Create School Form */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto w-full bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#1E293B] p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-[#1E293B]">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Formulaire de création d'un établissement
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Configurez les informations officielles de votre complexe scolaire
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  Nom officiel de l'établissement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Complexe Scolaire Saint-Exupéry"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Brazzaville, Pointe-Noire, Kinshasa"
                    value={schoolCity}
                    onChange={(e) => setSchoolCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                    Pays *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: République du Congo, RDC, Cameroun"
                    value={schoolCountry}
                    onChange={(e) => setSchoolCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                    Année Scolaire *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2026-2027"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                    Devise Monétaire *
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FCFA">Franc CFA (FCFA / XAF / XOF)</option>
                    <option value="USD">Dollar Américain ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="CDF">Franc Congolais (CDF)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  Chef d'Établissement / Directeur Fondateur
                </label>
                <input
                  type="text"
                  placeholder="Ex: Le Directeur / La Directrice"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  Devise de l'école (Motto)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Travail - Rigueur - Réussite"
                  value={schoolMotto}
                  onChange={(e) => setSchoolMotto(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Créer et continuer vers le choix du rôle</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-slate-200/80 dark:border-[#1E293B] bg-white/50 dark:bg-[#111827]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
        <span>ERP ADLON • Plateforme Multi-Établissements & Gestion par Rôles</span>
        
        <button
          type="button"
          onClick={() => setShowRulesModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
        >
          <Code className="w-3.5 h-3.5 text-blue-500" />
          <span>Règles Firestore Cloud</span>
        </button>
      </footer>

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E293B]">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                  Règles de Sécurité Firestore (Console Firebase)
                </h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Si vous souhaitez synchroniser en temps réel dans votre projet Firebase <strong>erp-adlon</strong>, collez ces règles dans <em>Firestore Database &gt; Règles</em> dans la console Firebase :
            </p>

            <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto border border-slate-800">
              {FIRESTORE_RULES_SNIPPET}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                L'application fonctionne immédiatement avec cache local &amp; cloud.
              </span>
              <button
                onClick={copyRules}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
              >
                {copiedRules ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedRules ? 'Copié !' : 'Copier les règles'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
