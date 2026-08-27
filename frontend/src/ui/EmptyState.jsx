import React from 'react';
import Button from './Button';

/**
 * Shared empty / error placeholder. The app previously rendered a blank grid
 * when a fetch returned nothing or failed.
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  tone = 'neutral',
  className = '',
}) {
  const iconTone =
    tone === 'error' ? 'text-danger bg-danger-soft' : 'text-subtle bg-surface-hover';

  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-10 ${className}`}
    >
      {Icon && (
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconTone}`}
        >
          <Icon size={28} aria-hidden="true" />
        </div>
      )}
      <p className="font-semibold text-text">{title}</p>
      {description && (
        <p className="text-sm text-muted mt-1 max-w-xs">{description}</p>
      )}
      {action && actionLabel && (
        <Button variant="secondary" size="sm" onClick={action} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
