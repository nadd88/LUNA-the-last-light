import React from 'react';
import { AlertOctagon, RotateCcw, RefreshCw } from 'lucide-react';

/**
 * Mission Control ErrorBoundary
 * Catches runtime React render crashes, displays the error message,
 * and provides a one-click button to purge corrupt saved state and restart.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("LUNA Mission Control Unhandled Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleResetSavedData = () => {
    try {
      localStorage.removeItem('luna_current_mission');
      localStorage.removeItem('luna_saved_missions');
      localStorage.removeItem('luna_game_mode');
      localStorage.removeItem('luna_settings');
      localStorage.removeItem('luna_tutorial_completed');
      localStorage.clear();
    } catch (e) {
      console.error("Failed to clear localStorage:", e);
    }
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || String(this.state.error) || "Unknown flight anomaly occurred.";
      const errorStack = this.state.error?.stack || this.state.errorInfo?.componentStack || "";

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans select-none">
          <div className="max-w-xl w-full bg-slate-900 border border-red-500/80 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <div className="flex items-center space-x-3 text-red-400 mb-4">
              <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-xl">
                <AlertOctagon className="w-8 h-8 text-red-400 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-red-400 uppercase">
                  MISSION CONTROL // CRITICAL ANOMALY DETECTED
                </span>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
                  Telemetry System Interrupted
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              A runtime component exception occurred while rendering the LUNA interface.
            </p>

            <div className="p-3.5 bg-black/60 border border-slate-800 rounded-lg text-xs font-mono text-red-300 mb-6 overflow-x-auto max-h-40">
              <div className="font-bold mb-1">Exception Details:</div>
              <div className="text-slate-200">{errorMessage}</div>
              {errorStack && (
                <div className="text-slate-500 text-[10px] mt-2 whitespace-pre-wrap">
                  {errorStack.slice(0, 500)}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={this.handleResetSavedData}
                className="w-full sm:w-auto flex-1 min-h-[44px] px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-display font-bold text-sm tracking-wide flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Saved Data & Restart</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs tracking-wider flex items-center justify-center space-x-2 border border-slate-700 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
