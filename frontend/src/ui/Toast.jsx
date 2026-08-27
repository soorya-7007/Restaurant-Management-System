import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CheckCircle, cls: 'text-success', ring: 'border-success/40' },
  error: { icon: XCircle, cls: 'text-danger', ring: 'border-danger/40' },
  warning: { icon: AlertTriangle, cls: 'text-warning', ring: 'border-warning/40' },
  info: { icon: Info, cls: 'text-info', ring: 'border-info/40' },
};

/**
 * Replaces the seven `alert()` calls that previously stood in for feedback.
 * Rendered into an aria-live region so screen readers announce it too.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ title, description, tone = 'info', duration = 4000, action }) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, title, description, tone, action }]);
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration)
        );
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast,
      dismiss,
      success: (title, opts) => toast({ ...opts, title, tone: 'success' }),
      error: (title, opts) => toast({ ...opts, title, tone: 'error', duration: 6000 }),
      warning: (title, opts) => toast({ ...opts, title, tone: 'warning' }),
      info: (title, opts) => toast({ ...opts, title, tone: 'info' }),
    }),
    [toast, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="fixed z-[100] flex flex-col gap-2 pointer-events-none
                   bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm
                   sm:bottom-auto sm:left-auto sm:translate-x-0 sm:top-4 sm:right-4"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const tone = TONES[t.tone] ?? TONES.info;
            const Icon = tone.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${tone.ring}
                            bg-surface-raised px-4 py-3 shadow-[var(--shadow-card)]`}
              >
                <Icon size={20} className={`${tone.cls} mt-0.5 shrink-0`} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text break-words">{t.title}</p>
                  {t.description && (
                    <p className="text-xs text-muted mt-0.5 break-words">{t.description}</p>
                  )}
                  {t.action && (
                    <button
                      type="button"
                      onClick={() => {
                        t.action.onClick();
                        dismiss(t.id);
                      }}
                      className="mt-2 text-xs font-semibold text-brand hover:underline focus-ring rounded"
                    >
                      {t.action.label}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="text-subtle hover:text-text transition-colors focus-ring rounded p-0.5 shrink-0"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
