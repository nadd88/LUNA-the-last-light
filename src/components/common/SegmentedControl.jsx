import React from 'react';
import { renderIcon } from './renderIcon';

/**
 * Accessible LUNA SegmentedControl Component
 * Rule: Full-word labels ONLY (no cryptic single-letter abbreviations).
 */
export default function SegmentedControl({
  options, // Array of { value: string, label: string, icon?: Component | Element, disabled?: boolean }
  value,
  onChange,
  size = 'md', // 'sm' | 'md'
  ariaLabel = 'Select option',
  className = '',
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex p-1 rounded-lg bg-slate-950/80 border border-slate-800 gap-1 select-none ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={`min-h-[36px] px-3 py-1.5 rounded-md font-sans text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              isSelected
                ? 'bg-cyan-500/20 border border-cyan-400/80 text-cyan-200 font-semibold shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {renderIcon(opt.icon, { className: 'w-3.5 h-3.5 shrink-0', 'aria-hidden': true })}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
