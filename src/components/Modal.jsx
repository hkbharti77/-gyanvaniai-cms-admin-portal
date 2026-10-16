import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  maxWidth = 'max-w-lg',
  children,
  footer,
}) {
  // Prevent background scroll when modal is open and handle Esc key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/70 backdrop-blur-md p-4 sm:p-6 flex min-h-screen items-center justify-center animate-fade-in">
      {/* Clickable Backdrop overlay */}
      <div
        className="fixed inset-0 -z-10 bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative bg-white rounded-2xl border border-slate-200/90 shadow-2xl ${maxWidth} w-full max-h-[calc(100vh-2.5rem)] flex flex-col overflow-hidden my-auto transition-all`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Pinned Header */}
        {(title || onClose) && (
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              {Icon && (
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Icon className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h2 className="text-base font-bold text-slate-900 leading-tight truncate">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
                )}
              </div>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {children}
        </div>

        {/* Pinned Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2.5 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
