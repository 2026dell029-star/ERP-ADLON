import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  private handleResetData = () => {
    try {
      localStorage.removeItem('adlon_config');
      localStorage.removeItem('adlon_students');
      localStorage.removeItem('adlon_staff');
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex items-center justify-center p-4 antialiased">
          <div className="max-w-md w-full bg-[#151D2E] border border-[#222F46] rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#F8FAFC]">
                Une anomalie temporaire est survenue
              </h2>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Le système a intercepté une erreur pour préserver l'intégrité de vos données scolaires.
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 bg-[#0B0F19] rounded-xl text-left border border-slate-800 text-xs font-mono text-rose-400 break-all max-h-32 overflow-y-auto">
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Recharger
              </button>

              <button
                onClick={this.handleResetData}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm transition-all border border-slate-700 cursor-pointer"
                title="Restaure les données de démonstration sans perte des paramètres d'usine"
              >
                <Trash2 className="w-4 h-4" />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
