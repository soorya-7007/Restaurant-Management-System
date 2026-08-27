import React from 'react';

/** Title / subtitle / actions row shared by all four pages. */
function PageHeader({ title, subtitle, icon: Icon, children, className = '' }) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text flex items-center gap-2.5">
          {Icon && <Icon className="text-brand shrink-0" aria-hidden="true" />}
          <span className="truncate">{title}</span>
        </h1>
        {subtitle && <p className="text-muted font-medium mt-1">{subtitle}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">{children}</div>
      )}
    </div>
  );
}

export default PageHeader;
