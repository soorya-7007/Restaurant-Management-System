import React from 'react';
import Card from './Card';

const TONES = {
  success: 'bg-success-soft text-success',
  brand: 'bg-brand-soft text-brand',
  info: 'bg-info-soft text-info',
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
};

/** KPI tile for the admin dashboard. */
function StatCard({ label, value, icon: Icon, tone = 'brand', hint, emphasis = false }) {
  return (
    <Card className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-muted text-sm font-medium mb-1">{label}</p>
        <p
          className={`text-2xl sm:text-3xl font-bold truncate ${
            emphasis ? 'text-danger' : 'text-text'
          }`}
        >
          {value}
        </p>
        {hint && <p className="text-xs text-subtle mt-1">{hint}</p>}
      </div>
      {Icon && (
        <div
          className={`p-3 sm:p-4 rounded-2xl shrink-0 ${TONES[tone] ?? TONES.brand}`}
        >
          <Icon size={24} aria-hidden="true" />
        </div>
      )}
    </Card>
  );
}

export default StatCard;
