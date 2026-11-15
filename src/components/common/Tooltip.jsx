import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { renderIcon } from './renderIcon';

/**
 * Accessible LUNA Tooltip Component
 * Displays a concise one-sentence explanation on hover, focus, or tap.
 */
export default function Tooltip({
  content,
  text,
  children,
  position = 'top', // 'top' | 'bottom'
  showIcon = false,
  icon = null,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipText = text || content;

  if (!tooltipText) return children;

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  }[position] || 'bottom-full left-1/2 -translate-x-1/2 mb-2';

  return (
    <span
      className={`relative inline-flex items-center group/tooltip ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      onClick={(e) => {
        // Toggle on tap for mobile touch devices
        e.stopPropagation();
        setIsVisible((prev) => !prev);
      }}
    >
      {children}
      {showIcon && (
        renderIcon(icon || HelpCircle, { className: 'w-3.5 h-3.5 ml-1 text-slate-400 hover:text-cyan-300 shrink-0 cursor-help', 'aria-hidden': true })
      )}

      {isVisible && (
        <span
          role="tooltip"
          className={`absolute ${positionStyles} z-50 w-56 p-2 rounded-lg bg-slate-900/95 border border-slate-700 text-xs text-slate-200 shadow-xl backdrop-blur-md pointer-events-none transition-opacity duration-150 animate-in fade-in-0 zoom-in-95`}
        >
          {tooltipText}
        </span>
      )}
    </span>
  );
}
