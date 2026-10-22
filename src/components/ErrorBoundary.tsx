import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in HabitPulse application:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetDataAndReload = () => {
    if (confirm('Vols restablir les dades locals per solucionar l’error? (Es guardaran les dades bàsiques)')) {
      try {
        localStorage.clear();
      } catch (e) {
        console.warn('Could not clear storage:', e);
      }
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-white">
                S'ha produït un error inesperat
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                L'aplicació ha trobat una excepció durant l'execució. Pots recarregar la pàgina o
                reiniciar les dades temporals si persisteix.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-left overflow-x-auto text-[11px] font-mono text-rose-300 max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recarregar pàgina</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetDataAndReload}
                className="w-full sm:flex-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reiniciar dades</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
