import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { renderIcon } from './renderIcon';

/**
 * Accessible LUNA ConfirmDialog Component
 * Required for critical actions:
 * - "Reset mission"
 * - "Finish / Conclude mission"
 * - "Abort sequence"
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmText = null,
  cancelLabel = 'Cancel',
  cancelText = null,
  isDanger = false,
  variant = null,
  icon = null,
  onConfirm,
  onCancel,
}) {
  const isDangerous = isDanger || variant === 'danger';
  const finalConfirmLabel = confirmText || confirmLabel;
  const finalCancelLabel = cancelText || cancelLabel;

  const defaultIcon = isDangerous ? AlertTriangle : HelpCircle;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-3 py-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          isDangerous ? 'bg-red-950/60 border border-red-500/50 text-red-400' : 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-400'
        }`}>
          {renderIcon(icon || defaultIcon, { className: 'w-5 h-5', 'aria-hidden': true })}
        </div>
        <div className="flex-1 text-sm text-slate-200 font-sans leading-relaxed">
          {message}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          {finalCancelLabel}
        </Button>
        <Button
          variant={isDangerous ? 'danger' : 'primary'}
          onClick={onConfirm}
        >
          {finalConfirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
