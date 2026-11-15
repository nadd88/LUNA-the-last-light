import React from 'react';
import { Loader2 } from 'lucide-react';
import { renderIcon } from './renderIcon';

/**
 * Accessible LUNA Button Component
 * - Minimum 44px tap target for mobile touch accessibility
 * - Variants: primary, secondary, ghost, danger
 * - Focus-visible ring, disabled, and loading states
 * - Accepts icons as either JSX elements or component references
 */
export default function Button({
  children,
  variant = 'secondary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md',           // 'sm' | 'md' | 'lg'
  icon = null,
  iconRight = null,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  title,
  ariaLabel,
  ...props
}) {
  const sizeClasses = {
    sm: 'min-h-[40px] px-3 py-1.5 text-sm gap-1.5',
    md: 'min-h-[44px] px-4 py-2 text-sm gap-2',
    lg: 'min-h-[52px] px-6 py-3 text-base gap-2.5 font-bold',
  }[size] || 'min-h-[44px] px-4 py-2 text-sm gap-2';

  const variantClasses = {
    primary:
      'bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(0,240,255,0.35)] border border-cyan-300/60 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    secondary:
      'bg-slate-900/90 hover:bg-slate-800 text-slate-100 hover:text-white border border-slate-700/80 hover:border-slate-500 active:bg-slate-950 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    ghost:
      'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent hover:border-slate-700 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    danger:
      'bg-red-950/40 hover:bg-red-900/60 text-red-200 hover:text-white border border-red-500/50 hover:border-red-400 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
  }[variant] || '';

  const disabledClasses = (disabled || loading)
    ? 'opacity-45 cursor-not-allowed pointer-events-none shadow-none'
    : 'cursor-pointer active:scale-[0.98] transition-all duration-150';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      title={title}
      className={`inline-flex items-center justify-center rounded-lg font-sans select-none ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        renderIcon(icon, { className: 'w-4 h-4 shrink-0', 'aria-hidden': true })
      )}
      
      <span>{children}</span>

      {!loading && renderIcon(iconRight, { className: 'w-4 h-4 shrink-0', 'aria-hidden': true })}
    </button>
  );
}
