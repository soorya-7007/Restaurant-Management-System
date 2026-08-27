import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { IconButton } from './Button';

/**
 * Persisted light/dark switch. Available on every page — the old toggle lived
 * only inside the POS and reset on navigation or refresh.
 */
function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <IconButton
      icon={isDark ? Sun : Moon}
      label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className={className}
    />
  );
}

export default ThemeToggle;
