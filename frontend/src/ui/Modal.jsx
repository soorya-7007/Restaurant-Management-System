import React, { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { IconButton } from './Button';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * One accessible dialog shell. The settings modal and CheckoutModal each rolled
 * their own before this, and neither trapped focus, restored focus on close,
 * closed on Escape, or locked background scroll.
 */
function Modal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  footer,
  size = 'md',
  dismissable = true,
}) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const titleId = useId();

  const requestClose = useCallback(() => {
    if (dismissable) onClose?.();
  }, [dismissable, onClose]);

  // Remember what had focus so we can hand it back on close.
  useEffect(() => {
    if (isOpen) previouslyFocused.current = document.activeElement;
    else previouslyFocused.current?.focus?.();
  }, [isOpen]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Move focus in, then keep Tab cycling inside the panel.
  useEffect(() => {
    if (!isOpen) return;

    const focusFirst = requestAnimationFrame(() => {
      const nodes = panelRef.current?.querySelectorAll(FOCUSABLE);
      (nodes?.[0] ?? panelRef.current)?.focus?.();
    });

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        requestClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const nodes = Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) ?? []);
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      cancelAnimationFrame(focusFirst);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [isOpen, requestClose]);

  const maxWidth =
    { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }[size] ??
    'max-w-md';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={requestClose}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                     bg-black/60 backdrop-blur-sm p-0 sm:p-4"
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${maxWidth} bg-surface-raised border border-border
                        rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden
                        max-h-[92dvh] flex flex-col focus:outline-none`}
          >
            {title && (
              <header className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border shrink-0">
                <h2
                  id={titleId}
                  className="text-lg font-bold text-text flex items-center gap-2 min-w-0"
                >
                  {Icon && <Icon size={20} className="text-brand shrink-0" aria-hidden="true" />}
                  <span className="truncate">{title}</span>
                </h2>
                {dismissable && (
                  <IconButton icon={X} label="Close dialog" onClick={onClose} size={18} />
                )}
              </header>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-6 py-5 sm:py-6">
              {children}
            </div>

            {footer && (
              <footer className="px-5 sm:px-6 py-4 border-t border-border shrink-0">
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Modal;
