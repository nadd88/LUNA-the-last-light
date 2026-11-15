import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { renderIcon } from './renderIcon';

/**
 * Accessible LUNA Toast Component
 * Temporary status notification for actions, updates, and quick alerts.
 */
export default function Toast({
  isOpen,
  message,
  variant = 'info', // 'info' | 'success' | 'warning' | 'danger'
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!isOpen || !duration) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  const Icon = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: AlertCircle,
  }[variant] || Info;

  const variantStyles = {
    info: 'bg-slate-900 border-blue-500/50 text-blue-200',
    success: 'bg-slate-900 border-emerald-500/50 text-emerald-200',
    warning: 'bg-slate-900 border-amber-500/50 text-amber-200',
    danger: 'bg-slate-900 border-red-500/50 text-red-200',
  }[variant] || 'bg-slate-900 border-slate-700 text-slate-200';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-lg border p-3.5 shadow-2xl flex items-center gap-3 font-sans text-sm ${variantStyles}`}
        >
          {renderIcon(Icon, { className: 'w-5 h-5 shrink-0', 'aria-hidden': true })}
          <span className="flex-1 text-slate-100">{message}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
