import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { renderIcon } from './renderIcon';

/**
 * Accessible LUNA Badge
 * Rule: Color alone is NEVER used for status. Always includes an icon + text.
 * Replaces every legacy "Selected / Active / GO / Nominal" raw chip.
 */
export default function Badge({
  children,
  variant = 'info', // 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  icon: CustomIcon = null,
  size = 'md',      // 'sm' | 'md'
  className = '',
}) {
  const DefaultIcon = {
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: AlertCircle,
    info: Info,
    neutral: Info
  }[variant] || Info;

  const variantStyles = {
    success: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300',
    warning: 'bg-amber-950/40 border-amber-500/50 text-amber-300',
    danger: 'bg-red-950/40 border-red-500/50 text-red-300',
    info: 'bg-blue-950/40 border-blue-500/50 text-blue-300',
    neutral: 'bg-slate-900 border-slate-700 text-slate-300',
  }[variant] || 'bg-slate-900 border-slate-700 text-slate-300';

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
  }[size] || 'px-2.5 py-1 text-sm gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-sans font-medium rounded-md border ${variantStyles} ${sizeStyles} ${className}`}
    >
      {renderIcon(CustomIcon || DefaultIcon, { className: 'w-3.5 h-3.5 shrink-0', 'aria-hidden': true })}
      <span>{children}</span>
    </span>
  );
}
