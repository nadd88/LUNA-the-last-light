import React from 'react';
import Tooltip from './Tooltip';
import { renderIcon } from './renderIcon';

/**
 * Accessible LUNA StatMeter Component
 * Replaces both the cluttered HUD chips and Mission Control stat cards.
 * Combines: Icon, plain label, value, progress bar, semantic status color, and optional tooltip.
 */
export default function StatMeter({
  icon,
  label,
  value,
  unit = '',
  percent = null,
  percentage = null,
  status = 'info', // 'success' | 'warning' | 'danger' | 'info' | 'nominal'
  tooltip = null,
  tooltipText = null,
  sublabel = null,
  subtext = null,
  compact = false,
  className = '',
}) {
  const normStatus = status === 'nominal' ? 'success' : status;

  const statusColors = {
    success: {
      bar: 'bg-emerald-400',
      text: 'text-emerald-300',
      badge: 'border-emerald-500/40 bg-emerald-950/30',
      icon: 'text-emerald-400',
    },
    warning: {
      bar: 'bg-amber-400',
      text: 'text-amber-300',
      badge: 'border-amber-500/40 bg-amber-950/30',
      icon: 'text-amber-400',
    },
    danger: {
      bar: 'bg-red-400',
      text: 'text-red-300',
      badge: 'border-red-500/40 bg-red-950/30',
      icon: 'text-red-400',
    },
    info: {
      bar: 'bg-cyan-400',
      text: 'text-slate-100',
      badge: 'border-slate-700 bg-slate-900/80',
      icon: 'text-cyan-400',
    },
    neutral: {
      bar: 'bg-slate-500',
      text: 'text-slate-300',
      badge: 'border-slate-800 bg-slate-900/60',
      icon: 'text-slate-400',
    },
  }[normStatus] || {
    bar: 'bg-cyan-400',
    text: 'text-slate-100',
    badge: 'border-slate-700 bg-slate-900/80',
    icon: 'text-slate-400',
  };

  const actualPercent = percent !== null ? percent : percentage;
  const clampedPercent = actualPercent !== null ? Math.max(0, Math.min(100, actualPercent)) : null;
  const actualSubtext = subtext || sublabel;
  const actualTooltip = tooltipText || tooltip;

  const content = (
    <div
      className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${statusColors.badge} ${className}`}
    >
      {/* Top Header: Icon + Label + Value */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          {renderIcon(icon, { className: `w-4 h-4 shrink-0 ${statusColors.icon}`, 'aria-hidden': true })}
          <span className="text-xs font-mono font-medium text-slate-300 truncate">{label}</span>
        </div>
        <div className="flex items-baseline gap-1 shrink-0 font-mono text-xs sm:text-sm font-bold">
          <span className={statusColors.text}>{value}</span>
          {unit && <span className="text-xs text-slate-400">{unit}</span>}
        </div>
      </div>

      {/* Progress Bar (if percent provided) */}
      {clampedPercent !== null && (
        <div className="w-full bg-slate-800/90 rounded-full h-1.5 overflow-hidden my-1">
          <div
            className={`h-full rounded-full transition-all duration-300 ${statusColors.bar}`}
            style={{ width: `${clampedPercent}%` }}
            role="progressbar"
            aria-valuenow={clampedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} progress`}
          />
        </div>
      )}

      {/* Optional Subtext */}
      {actualSubtext && (
        <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
          {actualSubtext}
        </div>
      )}
    </div>
  );

  if (actualTooltip) {
    return (
      <Tooltip text={actualTooltip}>
        {content}
      </Tooltip>
    );
  }

  return content;
}
