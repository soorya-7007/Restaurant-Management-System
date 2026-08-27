import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-brand text-brand-contrast hover:bg-brand-hover shadow-sm active:scale-[0.98]',
  secondary:
    'bg-surface-raised text-text border border-border hover:bg-surface-hover hover:border-border-strong active:scale-[0.98]',
  ghost: 'text-muted hover:text-text hover:bg-surface-hover',
  danger:
    'bg-danger-soft text-danger hover:brightness-95 dark:hover:brightness-110 active:scale-[0.98]',
  success:
    'bg-success text-white hover:brightness-105 active:scale-[0.98] shadow-sm',
};

const SIZES = {
  // Minimum 44px tall so touch targets clear the WCAG / iOS guideline.
  sm: 'text-sm px-3 py-2 gap-1.5 rounded-lg min-h-[36px]',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-xl min-h-[44px]',
  lg: 'text-base px-6 py-3.5 gap-2 rounded-xl min-h-[52px]',
};

/**
 * Shared button. Replaces a dozen bespoke gradient/hover class strings and
 * guarantees every control has the same focus ring and disabled treatment.
 */
function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center font-semibold transition-all focus-ring',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin shrink-0" aria-hidden="true" />
      ) : (
        Icon && <Icon size={18} className="shrink-0" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

/**
 * Square icon-only button. `label` is required — every icon control in the app
 * previously shipped without an accessible name.
 */
export function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 20,
  active = false,
  className = '',
  ...rest
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={rest['aria-pressed']}
      className={[
        'inline-flex items-center justify-center rounded-xl transition-colors focus-ring',
        'min-h-[44px] min-w-[44px]',
        active
          ? 'bg-brand-soft text-brand'
          : variant === 'danger'
            ? 'text-muted hover:text-danger hover:bg-danger-soft'
            : 'text-muted hover:text-text hover:bg-surface-hover',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <Icon size={size} aria-hidden="true" />
    </button>
  );
}

export default Button;
