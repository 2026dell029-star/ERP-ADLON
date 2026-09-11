import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  School, 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Sun, 
  Moon, 
  AlertCircle,
  GraduationCap,
  Copy,
  Check,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Coins,
  HelpCircle
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
    resetUserPassword 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          setError('Veuillez renseigner le nom de l\'école.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName.trim());
      } else if (mode === 'reset') {
        await resetUserPassword(email);
        setSuccessMsg('Un lien de réinitialisation sécurisé vous a été envoyé par e-mail.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const msg = err.message || '';
      if (
        msg.includes('auth/invalid-credential') || 
        msg.includes('auth/wrong-password') || 
        msg.includes('auth/user-not-found') || 
        msg.includes('incorrect')
      ) {
        setError('Identifiants incorrects. Vérifiez votre adresse e-mail ou votre mot de passe.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setError('Cette adresse e-mail est déjà associée à un compte établissement.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Le mot de passe doit comporter au moins 6 caractères.');
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
        setError(msg || 'Impossible de se connecter avec Google. Veuillez utiliser la connexion par e-mail ci-dessous.');
      }
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080C14] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col justify-between transition-colors duration-200 antialiased selection:bg-blue-500/25">
      
      {/* Top Header */}
      <header className="px-6 sm:px-10 py-4.5 flex items-center justify-between border-b border-slate-200/80 dark:border-[#1E293B] bg-white/80 dark:bg-[#0D1322]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight text-[#0F172A] dark:text-white leading-none">
                ERP ADLON
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                Portail Établissement
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              Système de Pilotage Académique & Administratif
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Congolese Flag subtle ribbon indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-[#009543]"></span>
            <span>Brazzaville • Congo</span>
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer shadow-2xs"
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            aria-label="Changer le thème"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: School Presentation & Features (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left hidden lg:block">
            {/* National Banner */}
            <div className="flex items-center gap-1.5 h-1.5 w-32 rounded-full overflow-hidden mb-2">
              <div className="flex-1 bg-[#009543] h-full"></div>
              <div className="flex-1 bg-[#FBDE4A] h-full"></div>
              <div className="flex-1 bg-[#DC241F] h-full"></div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200/60 dark:border-blue-900/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Session Scolaire 2026-2027</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-[#0F172A] dark:text-white leading-tight">
              Pilotez votre établissement scolaire en toute sérénité.
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Connectez-vous pour accéder à l'espace de votre école, ou inscrivez un nouvel établissement pour configurer vos effectifs, vos classes et vos finances.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                  <GraduationCap className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#0F172A] dark:text-white">Bulletins & Évaluations Officielles</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Calcul automatique des moyennes pondérées, rangs de classe et impression A4 officielle conforme.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                  <Coins className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#0F172A] dark:text-white">Trésorerie & Recouvrement WhatsApp</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Suivi précis des écolages prorata temporis et relances automatiques par message aux parents.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#0F172A] dark:text-white">Rôles Sécurisés & Multi-Écoles</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Accès dédié Direction, Gestionnaire et Études avec traçabilité intégrale des écritures.
                  </p>
                </div>
              </div>
            </div>

            {/* School Motto quote */}
            <div className="pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 italic">
              « Rigueur - Discipline - Excellence » • République du Congo
            </div>
          </div>

          {/* Right Column: Authentication Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-9 shadow-xl shadow-slate-200/40 dark:shadow-none transition-colors">
              
              {/* Header inside card */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white mx-auto flex items-center justify-center mb-3.5 shadow-lg shadow-blue-500/25">
                  {mode === 'register' ? (
                    <Building2 className="w-6 h-6" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
                  {mode === 'login' && 'Connexion à votre espace'}
                  {mode === 'register' && 'Créer une nouvelle école'}
                  {mode === 'reset' && 'Réinitialiser votre mot de passe'}
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
                  {mode === 'login' && 'Entrez vos identifiants pour accéder à la gestion de votre établissement.'}
                  {mode === 'register' && 'Inscrivez votre établissement scolaire pour commencer à le piloter.'}
                  {mode === 'reset' && 'Saisissez votre e-mail pour recevoir les instructions de réinitialisation.'}
                </p>
              </div>

              {/* Segmented Mode Switcher: "Se connecter" vs "Créer une école" */}
              {mode !== 'reset' && (
                <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6 text-xs font-bold border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => { 
                      setMode('login'); 
                      setError(null); 
                      setDomainErrorHost(null); 
                      setSuccessMsg(null); 
                    }}
                    className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      mode === 'login'
                        ? 'bg-white dark:bg-[#0B0F19] text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Se connecter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { 
                      setMode('register'); 
                      setError(null); 
                      setDomainErrorHost(null); 
                      setSuccessMsg(null); 
                    }}
                    className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      mode === 'register'
                        ? 'bg-white dark:bg-[#0B0F19] text-blue-600 dark:text-blue-400 shadow-xs font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Créer une école</span>
                  </button>
                </div>
              )}

              {/* Domain Warning (Google OAuth domain setup) */}
              {domainErrorHost && (
                <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                  <div className="flex items-start gap-2 mb-2 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <span>Configuration Google OAuth requise</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 mb-2 leading-relaxed">
                    Pour autoriser Google OAuth sur cette adresse, ajoutez ce domaine dans la console Firebase (<strong>Authentication &gt; Settings &gt; Authorized domains</strong>) :
                  </p>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-900/50 font-mono text-[11px] text-amber-950 dark:text-amber-100 break-all">
                    <span className="flex-1 select-all">{domainErrorHost}</span>
                    <button
                      type="button"
                      onClick={handleCopyHost}
                      className="px-2.5 py-1 bg-white dark:bg-[#111827] text-amber-800 dark:text-amber-200 hover:text-amber-950 rounded-lg border border-amber-300 dark:border-amber-700 text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      {copiedHost ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHost ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Standard Error Alert */}
              {error && !domainErrorHost && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span className="font-medium leading-relaxed">{error}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                  <span className="font-medium leading-relaxed">{successMsg}</span>
                </div>
              )}

              {/* Google Sign-in Button */}
              {mode !== 'reset' && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-white flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Continuer avec Google</span>
                  </button>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-white dark:bg-[#111827] px-3.5 text-slate-400 dark:text-slate-500 font-bold tracking-wider">
                        ou par e-mail
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Field: Nom de l'école (Shown when creating school) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      Nom de l'école <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Ex: Complexe Scolaire ADLON, Lycée Savorgnan..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <span className="text-[10.5px] text-slate-400 mt-1 block">
                      Ce nom figurera sur les bulletins scolaires officiels et les états de paiement.
                    </span>
                  </div>
                )}

                {/* Field: Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Adresse e-mail <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="direction@votre-ecole.cg"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Field: Password */}
                {mode !== 'reset' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Mot de passe <span className="text-rose-500">*</span>
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { 
                            setMode('reset'); 
                            setError(null); 
                            setDomainErrorHost(null); 
                            setSuccessMsg(null); 
                          }}
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                        >
                          Mot de passe oublié ?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
                        title={showPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === 'login' && 'Se connecter à l\'espace école'}
                        {mode === 'register' && 'Créer l\'école & Commencer'}
                        {mode === 'reset' && 'Envoyer le lien de réinitialisation'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Reset Mode Return */}
                {mode === 'reset' && (
                  <button
                    type="button"
                    onClick={() => { 
                      setMode('login'); 
                      setError(null); 
                      setDomainErrorHost(null); 
                      setSuccessMsg(null); 
                    }}
                    className="w-full py-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold"
                  >
                    &larr; Retourner à l'écran de connexion
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4.5 px-6 border-t border-slate-200/80 dark:border-[#1E293B] bg-white/60 dark:bg-[#0D1322]/60 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ERP ADLON • Portail Officiel de Pilotage Scolaire & Administratif</span>
          <span className="text-[11px] text-slate-400">République du Congo • MEP-DGEP</span>
        </div>
      </footer>
    </div>
  );
};
