import React from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ size = 24, className = '', label = 'Loading' }) {
  return (
    <Loader2
      size={size}
      role="status"
      aria-label={label}
      className={`animate-spin ${className}`}
    />
  );
}

export default Spinner;
