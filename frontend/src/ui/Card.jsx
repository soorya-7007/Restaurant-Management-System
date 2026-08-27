import React from 'react';

/**
 * The panel shell that was repeated as
 * `bg-white/5 border border-white/10 rounded-2xl backdrop-blur` across ~12
 * call sites, now token-driven so it works in both colour schemes.
 */
function Card({ as: Tag = 'div', padded = true, className = '', children, ...rest }) {
  return (
    <Tag
      className={[
        'bg-surface-raised border border-border rounded-2xl',
        'shadow-[var(--shadow-card)]',
        padded ? 'p-5 sm:p-6' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Card;
