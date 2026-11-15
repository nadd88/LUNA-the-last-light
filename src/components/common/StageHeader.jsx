import React from 'react';

/**
 * Accessible LUNA StageHeader Component
 * Compact 1-line title + 1-line goal layout to guarantee no page-level scrolling.
 */
export default function StageHeader({
  stepNumber,
  totalSteps = 6,
  title,
  goal = null,
  subtitle = null,
  className = '',
}) {
  const description = goal || subtitle;

  return (
    <header className={`flex-shrink-0 mb-2 sm:mb-3 text-center max-w-4xl mx-auto px-3 select-none ${className}`}>
      <div className="flex items-center justify-center gap-2">
        {stepNumber !== undefined && stepNumber !== null && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-mono font-medium text-cyan-400 shrink-0">
            Step {stepNumber} of {totalSteps}
          </span>
        )}
        <h1 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-slate-100 tracking-wide truncate">
          {title}
        </h1>
      </div>

      {description && (
        <p className="text-sm text-slate-300 font-sans truncate mt-0.5 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </header>
  );
}
