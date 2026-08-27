import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';

/**
 * Insights are a hardcoded setTimeout, not a model call — the header says so
 * rather than claiming to be a "Real-time AI Forecasting Engine".
 */
const DEMO_INSIGHTS = [
  {
    type: 'warning',
    text: 'Burger buns will deplete by 8:00 PM based on current order velocity.',
  },
  { type: 'success', text: 'Fries inventory is optimal for the weekend rush.' },
  {
    type: 'info',
    text: 'Consider running a promotion on Pizza to boost slow Tuesday sales.',
  },
];

const ICONS = { warning: AlertTriangle, success: CheckCircle, info: Sparkles };
const TONES = {
  warning: 'text-warning',
  success: 'text-success',
  info: 'text-info',
};
const LABELS = { warning: 'Warning', success: 'Healthy', info: 'Suggestion' };

function AIPredictor() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const runAnalysis = () => {
    setLoading(true);
    setInsights(null);
    setTimeout(() => {
      setInsights(DEMO_INSIGHTS);
      setLoading(false);
    }, 1600);
  };

  return (
    <section
      aria-label="Stock predictor"
      className="relative overflow-hidden h-full flex flex-col rounded-2xl p-5 sm:p-6
                 bg-brand-soft border border-brand/25"
    >
      <Sparkles
        size={120}
        className="absolute -top-3 -right-3 text-brand opacity-10 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h2 className="text-lg font-bold flex items-center gap-2 text-text">
            <Sparkles className="text-brand shrink-0" size={19} aria-hidden="true" />
            Stock predictor
          </h2>
          <p className="text-subtle text-xs mt-1 flex items-center gap-1.5">
            <span className="font-bold uppercase tracking-wider bg-warning-soft text-warning px-2 py-0.5 rounded-full">
              Demo
            </span>
            Sample forecasts, not a live model
          </p>
        </div>
        <Button icon={Sparkles} loading={loading} onClick={runAnalysis}>
          {loading ? 'Analysing…' : 'Run analysis'}
        </Button>
      </div>

      <div className="relative z-10 flex-1 bg-surface/70 rounded-xl p-4 border border-border min-h-[180px]">
        {!insights && !loading && (
          <p className="h-full flex items-center justify-center text-center text-sm text-muted px-2">
            Run an analysis to see sample insights on inventory depletion rates.
          </p>
        )}

        {loading && (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col gap-3"
          >
            <span className="sr-only">Generating insights…</span>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-surface-raised p-3.5 rounded-xl border border-border"
              >
                <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {insights && !loading && (
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-3"
              aria-live="polite"
            >
              {insights.map((item, idx) => {
                const Icon = ICONS[item.type] ?? Sparkles;
                return (
                  <motion.li
                    key={item.text}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3 bg-surface-raised p-3.5 rounded-xl border border-border"
                  >
                    <Icon
                      size={18}
                      className={`mt-0.5 shrink-0 ${TONES[item.type] ?? TONES.info}`}
                      aria-hidden="true"
                    />
                    <p className="text-sm text-text leading-relaxed">
                      <span className="sr-only">{LABELS[item.type]}: </span>
                      {item.text}
                    </p>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default AIPredictor;
