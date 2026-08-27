import React from 'react';

/**
 * The two blurred corner blobs used as page background. Extracted from the
 * three pages that each hand-rolled them, and now token-driven so the glow
 * softens appropriately in light mode.
 *
 * Purely decorative: no animation (the old infinite scale/opacity loop ran
 * forever on the login screen and burned GPU for no benefit) and hidden from
 * assistive tech.
 */
function AmbientGlow() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[50%] rounded-full blur-[120px]"
        style={{ backgroundColor: 'var(--glow-a)' }}
      />
      <div
        className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[50%] rounded-full blur-[120px]"
        style={{ backgroundColor: 'var(--glow-b)' }}
      />
    </div>
  );
}

export default AmbientGlow;
