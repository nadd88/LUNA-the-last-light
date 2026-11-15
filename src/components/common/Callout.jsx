import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { renderIcon } from './renderIcon';

/**
 * Accessible LUNA Callout Component
 * Used for critical rules, NASA context alerts, and operational notices.
 */
export default function Callout({
  variant = 'info', // 'info' | 'warning' | 'danger' | 'success'
  icon: CustomIcon = null,
  title = null,
  children,
  className = '',
}) {
  const DefaultIcon = {
    info: Info,
    warning: AlertTriangle,
    danger: AlertCircle,
    success: CheckCircle2,
  }[variant] || Info;

  const variantStyles = {
    info: 'bg-blue-950/30 border-blue-500/40 text-blue-200',
    warning: 'bg-amber-950/30 border-amber-500/40 text-amber-200',
    danger: 'bg-red-950/30 border-red-500/40 text-red-200',
    success: 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200',
  }[variant] || 'bg-slate-900 border-slate-700 text-slate-200';

  const iconColors = {
    info: 'text-blue-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    success: 'text-emerald-400',
  }[variant] || 'text-slate-400';

  return (
    <div
      role="region"
      aria-label={title || 'Notice'}
      className={`rounded-lg border p-3.5 flex items-start gap-3 text-sm leading-relaxed ${variantStyles} ${className}`}
    >
      {renderIcon(CustomIcon || DefaultIcon, { className: `w-5 h-5 shrink-0 mt-0.5 ${iconColors}`, 'aria-hidden': true })}
      <div className="flex-1 min-w-0">
        {title && <h2 className="font-semibold text-slate-100 mb-1">{title}</h2>}
        <div className="text-slate-300 font-sans">{children}</div>
      </div>
    </div>
  );
}
