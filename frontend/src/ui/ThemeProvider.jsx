import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { STORAGE_KEYS } from '../lib/constants';

const ThemeContext = createContext(null);

const isBrowser = typeof window !== 'undefined';

function systemPrefersDark() {
  return (
    isBrowser && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

function readStoredTheme() {
  if (!isBrowser) return 'system';
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'system';
}

function applyTheme(theme) {
  if (!isBrowser) return;
  const dark = theme === 'dark' || (theme === 'system' && systemPrefersDark());
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  // Follow the OS while the user is on "system".
  useEffect(() => {
    if (theme !== 'system' || !isBrowser) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const resolved = useMemo(
    () => (theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme),
    [theme]
  );

  const setTheme = useCallback((next) => setThemeState(next), []);

  const toggleTheme = useCallback(() => {
    setThemeState(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved]);

  const value = useMemo(
    () => ({ theme, resolved, isDark: resolved === 'dark', setTheme, toggleTheme }),
    [theme, resolved, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
