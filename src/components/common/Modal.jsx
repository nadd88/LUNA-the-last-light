import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { renderIcon } from './renderIcon';

/**
 * Accessible LUNA Modal Component
 * - Focus-trap & Escape key handling
 * - Screen-reader accessible (role="dialog", aria-modal="true")
 * - Backdrop with blur
 * - Accepts optional icon for header
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle = null,
  icon = null,
  children,
  maxWidth = 'max-w-lg', // 'max-w-sm' | 'max-w-md' | 'max-w-lg' | 'max-w-2xl' | 'max-w-4xl'
  className = '',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm -z-10"
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            className={`w-full ${maxWidth} bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-5 sm:p-6 relative max-h-[90vh] flex flex-col ${className}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                {icon && renderIcon(icon, { className: 'w-5 h-5 text-cyan-400 shrink-0', 'aria-hidden': true })}
                <div>
                  {title && (
                    <h2 id="modal-title" className="text-xl font-display font-bold text-slate-100">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="min-w-[36px] min-h-[36px] p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto text-sm text-slate-300 font-sans leading-relaxed pr-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
