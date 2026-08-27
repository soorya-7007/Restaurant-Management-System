import React, { useId } from 'react';

/**
 * Labelled text input with a real focus ring and wired-up error messaging.
 * The original inputs used `focus:outline-none` with no visible replacement
 * and had no associated <label>.
 */
function TextField({
  label,
  icon: Icon,
  error,
  hint,
  trailing,
  className = '',
  id: providedId,
  ...rest
}) {
  const autoId = useId();
  const id = providedId ?? autoId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-muted mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
          />
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined
          }
          className={`w-full bg-surface border rounded-xl py-3 text-text placeholder:text-subtle
                      transition-colors focus-ring min-h-[48px]
                      ${Icon ? 'pl-12' : 'pl-4'} ${trailing ? 'pr-12' : 'pr-4'}
                      ${error ? 'border-danger' : 'border-border hover:border-border-strong'}`}
          {...rest}
        />
        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-danger mt-1.5 font-medium">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-xs text-subtle mt-1.5">
          {hint}
        </p>
      )}
    </div>
  );
}

export default TextField;
