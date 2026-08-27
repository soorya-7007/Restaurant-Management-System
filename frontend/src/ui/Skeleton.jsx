import React from 'react';

/** Grey placeholder block used while data loads. */
export function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-surface-hover ${className}`}
    />
  );
}

/** Menu-card shaped placeholder for the POS grid. */
export function MenuCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface-raised overflow-hidden">
      <Skeleton className="h-36 sm:h-44 rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

/** Ticket-shaped placeholder for the KDS columns. */
export function TicketSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface-raised p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-14" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default Skeleton;
