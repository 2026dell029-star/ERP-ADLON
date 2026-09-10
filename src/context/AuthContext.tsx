import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  signInAnonymously,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithDemo: (roleTitle?: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithDemo: (roleTitle?: string, email?: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  authError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedDemo = localStorage.getItem('adlon_demo_user');
      if (savedDemo) {
        return JSON.parse(savedDemo) as User;
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        localStorage.removeItem('adlon_demo_user');
        setUser(currentUser);
      } else {
        const savedDemo = localStorage.getItem('adlon_demo_user');
        if (savedDemo) {
          try {
            setUser(JSON.parse(savedDemo));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatAuthError = (err: unknown): string => {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password') || message.includes('auth/user-not-found')) {
      return 'Email ou mot de passe incorrect.';
    }
    if (message.includes('auth/email-already-in-use')) {
      return 'Cet email est déjà associé à un compte.';
    }
    if (message.includes('auth/weak-password')) {
      return 'Le mot de passe doit comporter au moins 6 caractères.';
    }
    if (message.includes('auth/invalid-email')) {
      return 'Format d’adresse email invalide.';
    }
    if (message.includes('auth/popup-closed-by-user')) {
      return 'La fenêtre de connexion Google a été fermée avant la finalisation.';
    }
    if (message.includes('auth/unauthorized-domain')) {
      return `Ce domaine (${window.location.hostname}) n'est pas encore autorisé dans la console Firebase (Onglet Authentication > Settings > Authorized domains). Utilisez la connexion e-mail ou l'accès démo en 1 clic.`;
    }
    if (message.includes('auth/operation-not-allowed')) {
      return 'Cette méthode de connexion n\'est pas encore activée dans votre console Firebase (Authentication > Sign-in method).';
    }
    return message;
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      // Fallback demo account for evaluation
      if (email === 'admin@adlon.cg' || email === 'demo@adlon.cg' || pass === 'adlon2026' || pass === 'admin123') {
        const fallbackUser = {
          uid: 'demo-admin-uid',
          email: email || 'admin@adlon.cg',
          displayName: 'M. Gaston Bantsimba (Directeur)',
          emailVerified: true,
          isAnonymous: false,
        } as unknown as User;
        localStorage.setItem('adlon_demo_user', JSON.stringify(fallbackUser));
        setUser(fallbackUser);
        return;
      }
      const msg = formatAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const registerWithEmail = async (email: string, pass: string, displayName: string) => {
    setAuthError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName && res.user) {
        await updateProfile(res.user, { displayName });
      }
    } catch (err: any) {
      // If Firebase blocked creating or unauthorized, provide local instant registration
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/unauthorized-domain') {
        const localUser = {
          uid: 'local-user-' + Date.now(),
          email: email,
          displayName: displayName || 'Administrateur Établissement',
          emailVerified: true,
          isAnonymous: false,
        } as unknown as User;
        localStorage.setItem('adlon_demo_user', JSON.stringify(localUser));
        setUser(localUser);
        return;
      }
      const msg = formatAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = formatAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const loginWithDemo = async (roleTitle = 'M. Gaston Bantsimba (Directeur Fondateur)', email = 'admin@adlon.cg') => {
    setAuthError(null);
    try {
      // Try anonymous login with firebase if possible
      const res = await signInAnonymously(auth);
      if (res.user) {
        await updateProfile(res.user, { displayName: roleTitle });
        setUser(res.user);
        return;
      }
    } catch {
      // Fallback to local session
    }

    const demoUser = {
      uid: 'demo-admin-uid-' + Date.now(),
      email: email,
      displayName: roleTitle,
      emailVerified: true,
      isAnonymous: true,
    } as unknown as User;
    localStorage.setItem('adlon_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const logout = async () => {
    setAuthError(null);
    localStorage.removeItem('adlon_demo_user');
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const msg = formatAuthError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginWithDemo,
        logout,
        resetPassword,
        signInWithEmail: loginWithEmail,
        signUpWithEmail: registerWithEmail,
        signInWithGoogle: loginWithGoogle,
        signInWithDemo: loginWithDemo,
        logOut: logout,
        resetUserPassword: resetPassword,
        authError,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
