import React from 'react';
import { Target, AlertTriangle } from 'lucide-react';
import { renderIcon } from './renderIcon';

/**
 * Accessible LUNA ObjectiveBar Component
 * Always-visible current mission goal + progress indicator.
 * Keeps first-time players oriented on what to do next.
 */
export default function ObjectiveBar({
  title = null,
  objective = null,
  currentStep = null,
  totalSteps = null,
  metricLabel = null,
  metricValue = null,
  progressText = null,
  progressPercent = null,
  phaseLabel = 'CURRENT OBJECTIVE',
  warning = null,
  icon = null,
  className = '',
}) {
  const displayObjective = title || objective;

  let calculatedPercent = progressPercent;
  if (calculatedPercent === null && currentStep !== null && totalSteps !== null && totalSteps > 0) {
    calculatedPercent = Math.round((currentStep / totalSteps) * 100);
  }

  const displayProgressText = progressText || (metricLabel && metricValue ? `${metricLabel}: ${metricValue}` : null);

  return (
    <div
      role="region"
      aria-label="Mission Objective"
      className={`w-full bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 sm:px-4 shadow-md backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4 ${className}`}
    >
      {/* Objective Text */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-center shrink-0 text-cyan-400">
          {renderIcon(icon || Target, { className: 'w-4 h-4 text-cyan-400', 'aria-hidden': true })}
        </div>
        <div>
          <div className="text-[11px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
            {phaseLabel}
          </div>
          <div className="text-sm font-sans font-medium text-slate-100 leading-snug">
            {displayObjective}
          </div>
          {warning && (
            <div className="text-xs font-mono text-amber-300 flex items-center space-x-1.5 mt-0.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{warning}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Metric */}
      {(displayProgressText || calculatedPercent !== null) && (
        <div className="flex md:flex-col items-end gap-1.5 shrink-0 self-stretch md:self-auto justify-between md:justify-center border-t md:border-t-0 border-slate-800 pt-2 md:pt-0 font-mono text-xs">
          {displayProgressText && (
            <span className="font-semibold text-slate-200">
              {displayProgressText}
            </span>
          )}
          {calculatedPercent !== null && (
            <div className="flex items-center space-x-2">
              <div className="w-28 sm:w-32 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, calculatedPercent))}%` }}
                />
              </div>
              <span className="text-[11px] text-cyan-400">{calculatedPercent}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
