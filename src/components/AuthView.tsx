import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  School, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Sun, 
  Moon, 
  Flame,
  AlertCircle,
  HelpCircle,
  GraduationCap,
  Copy,
  Check,
  Zap,
  Briefcase
} from 'lucide-react';

interface AuthViewProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ theme, onToggleTheme }) => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    signInWithDemo,
    resetUserPassword 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [domainErrorHost, setDomainErrorHost] = useState<string | null>(null);
  const [copiedHost, setCopiedHost] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDomainErrorHost(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else if (mode === 'register') {
        if (!displayName.trim()) {
          setError('Veuillez renseigner votre nom complet.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName.trim());
      } else if (mode === 'reset') {
        await resetUserPassword(email);
        setSuccessMsg('Un lien de réinitialisation vous a été envoyé par e-mail.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const msg = err.message || '';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found') || msg.includes('incorrect')) {
        setError('Identifiants incorrects. Vérifiez votre e-mail ou mot de passe.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setError('Cette adresse e-mail est déjà associée à un compte.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
      } else {
        setError(msg || 'Une erreur est survenue lors de l\'authentification.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setDomainErrorHost(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google login error:', err);
      const msg = err.message || '';
      if (msg.includes('auth/popup-closed-by-user') || msg.includes('fermée')) {
        setError('La fenêtre de connexion Google a été fermée.');
      } else if (msg.includes('unauthorized-domain') || msg.includes('domaine')) {
        setDomainErrorHost(window.location.hostname);
        setError(`Ce domaine (${window.location.hostname}) n'est pas encore autorisé dans la console Firebase pour Google OAuth.`);
      } else {
        setError(msg || 'Impossible de se connecter avec Google. Veuillez réessayer ou utiliser l\'accès direct ci-dessous.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (title: string, userEmail: string) => {
    setError(null);
    setDomainErrorHost(null);
    setLoading(true);
    try {
      await signInWithDemo(title, userEmail);
    } catch (err: any) {
      console.error('Demo login error:', err);
      setError('Erreur lors de l\'accès démo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHost = () => {
    if (domainErrorHost || window.location.hostname) {
      navigator.clipboard.writeText(domainErrorHost || window.location.hostname);
      setCopiedHost(true);
      setTimeout(() => setCopiedHost(false), 2500);
    }
  };

  const fillTestCredentials = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setMode('login');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0B0F19] text-[#1D1D1F] dark:text-[#F8FAFC] flex flex-col justify-between transition-colors duration-200 antialiased selection:bg-blue-500/30">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-[#1E293B] bg-white/70 dark:bg-[#111827]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <School className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-[#0F172A] dark:text-[#F8FAFC] block leading-none">
              ERP ADLON
            </span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase mt-1 block">
              Pilotage Scolaire & Multi-Établissements
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 text-[11px] font-medium text-blue-700 dark:text-blue-300">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Serveur Firestore : <strong className="font-mono">erp-adlon</strong></span>
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero info (5 columns on desktop) */}
          <div className="lg:col-span-5 space-y-6 text-left hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Portail de Gestion Scolaire 2026-2027</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] leading-tight">
              Gérez votre établissement avec précision et fluidité.
            </h1>

            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Connectez-vous pour accéder à votre école, ou créez un nouvel établissement en quelques secondes. Vos données sont synchronisées en temps réel.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">3 Niveaux de Rôles Sécurisés</h2>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Dirigeant, Gestionnaire Financier & Directeur des Études.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Multi-Établissements</h2>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Créez votre propre école ou rejoignez un complexe existant.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1E293B] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Notes & Recouvrement WhatsApp (+242)</h2>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Calcul prorata temporis, bulletins scolaires et relances directes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Card (7 columns on desktop) */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#1E293B] p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
              
              {/* Header inside card */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center mb-3 shadow-lg shadow-blue-500/25">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {mode === 'login' && 'Connexion à votre compte'}
                  {mode === 'register' && 'Création d\'un compte administrateur'}
                  {mode === 'reset' && 'Réinitialiser votre mot de passe'}
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                  {mode === 'login' && 'Entrez vos identifiants pour accéder à vos établissements'}
                  {mode === 'register' && 'Inscrivez-vous pour créer et piloter votre école'}
                  {mode === 'reset' && 'Recevez un lien par e-mail pour créer un nouveau mot de passe'}
                </p>
              </div>

              {/* Quick Demo Access Bar */}
              <div className="mb-6 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-xl">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Accès Rapide Démo (1 Clic)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-200/70 dark:bg-blue-900/60 font-semibold text-blue-800 dark:text-blue-200">
                    Sans attente
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('M. Gaston Bantsimba (Directeur Fondateur)', 'directeur@adlon.cg')}
                    disabled={loading}
                    className="p-2 bg-white dark:bg-[#111827] hover:bg-blue-50/80 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800/60 rounded-lg text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      <CrownIcon className="w-3 h-3 text-amber-500" />
                      <span>👑 Dirigeant</span>
                    </div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate">Accès complet & école</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('Mme. Mireille Kouka (Gestionnaire Trésorerie)', 'gestionnaire@adlon.cg')}
                    disabled={loading}
                    className="p-2 bg-white dark:bg-[#111827] hover:bg-blue-50/80 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800/60 rounded-lg text-left transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      <Briefcase className="w-3 h-3 text-blue-500" />
                      <span>💼 Gestionnaire</span>
                    </div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate">Finances & Inscriptions</div>
                  </button>
                </div>
              </div>

              {/* Tabs for Login / Register */}
              {mode !== 'reset' && (
                <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#1E293B] rounded-xl mb-5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); setDomainErrorHost(null); setSuccessMsg(null); }}
                    className={`py-2 rounded-lg transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'bg-white dark:bg-[#0B0F19] text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                        : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                    }`}
                  >
                    Se connecter
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); setDomainErrorHost(null); setSuccessMsg(null); }}
                    className={`py-2 rounded-lg transition-all cursor-pointer ${
                      mode === 'register'
                        ? 'bg-white dark:bg-[#0B0F19] text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                        : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                    }`}
                  >
                    Créer un compte
                  </button>
                </div>
              )}

              {/* Domain Warning / Info when unauthorized domain in Firebase */}
              {domainErrorHost && (
                <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                  <div className="flex items-start gap-2 mb-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <span>Configuration Google Auth requise dans Firebase</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 mb-2 leading-relaxed">
                    Pour autoriser Google OAuth sur cette URL d'aperçu, ajoutez ce domaine dans la Console Firebase (<strong>Authentication &gt; Settings &gt; Authorized domains</strong>) :
                  </p>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-100/70 dark:bg-amber-900/50 font-mono text-[11px] text-amber-950 dark:text-amber-100 break-all">
                    <span className="flex-1 select-all">{domainErrorHost}</span>
                    <button
                      type="button"
                      onClick={handleCopyHost}
                      className="px-2 py-1 bg-white dark:bg-[#111827] text-amber-800 dark:text-amber-200 hover:text-amber-950 rounded border border-amber-300 dark:border-amber-700 text-[10px] font-sans font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedHost ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHost ? 'Copié !' : 'Copier'}</span>
                    </button>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-amber-800 dark:text-amber-300">Ou continuez directement ci-dessous :</span>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('M. Gaston Bantsimba (Directeur Fondateur)', 'directeur@adlon.cg')}
                      className="font-bold text-blue-700 dark:text-blue-300 underline cursor-pointer"
                    >
                      Entrer sans Google &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Standard Alerts */}
              {error && !domainErrorHost && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Google Sign-in */}
              {mode !== 'reset' && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-slate-50 dark:bg-[#1E293B]/70 hover:bg-slate-100 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Continuer avec Google</span>
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-[#1E293B]"></div>
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-white dark:bg-[#111827] px-3 text-[#64748B] dark:text-[#94A3B8] font-medium">
                        Ou par e-mail
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                      Nom complet ou Titre
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Ex: M. Gaston Bantsimba (Directeur)"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      Adresse e-mail
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => fillTestCredentials('admin@adlon.cg', 'adlon2026')}
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                      >
                        Remplir test (admin@adlon.cg)
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@ecole-adlon.cg"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {mode !== 'reset' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        Mot de passe
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setMode('reset'); setError(null); setDomainErrorHost(null); setSuccessMsg(null); }}
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Mot de passe oublié ?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 mt-1"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === 'login' && 'Se connecter à l\'ERP'}
                        {mode === 'register' && 'Créer mon compte & Démarrer'}
                        {mode === 'reset' && 'Envoyer les instructions'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {mode === 'reset' && (
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); setDomainErrorHost(null); setSuccessMsg(null); }}
                    className="w-full py-2 text-xs text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Retourner à l'écran de connexion
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-slate-200/80 dark:border-[#1E293B] bg-white/50 dark:bg-[#111827]/50 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
        <span>ERP ADLON • Système Unifié de Pilotage Scolaire • Base de données Firebase Sécurisée</span>
      </footer>
    </div>
  );
};

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
    </svg>
  );
}
