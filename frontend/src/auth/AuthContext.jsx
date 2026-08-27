import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api, { clearSession, setUnauthorizedHandler } from '../lib/api';
import { STORAGE_KEYS } from '../lib/constants';

const AuthContext = createContext(null);

/** Where each role lands after signing in. */
export const HOME_BY_ROLE = {
  Admin: '/admin',
  Chef: '/kitchen',
  Waiter: '/pos',
};

export function homeForRole(role) {
  return HOME_BY_ROLE[role] ?? '/pos';
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && parsed.role ? parsed : null;
  } catch {
    // Corrupt payload — treat as signed out rather than crashing on boot.
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Prevents a flash of the login screen while we rehydrate from storage.
  const [initializing, setInitializing] = useState(true);

  /**
   * The token was already persisted but the user object was not, so every
   * refresh dropped the session and bounced to /login. Rehydrate both.
   */
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    const stored = readStoredUser();
    if (token && stored) setUser(stored);
    else clearSession();
    setInitializing(false);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // Let an expired JWT clear React state too, not just localStorage.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem(STORAGE_KEYS.token, data.token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, logout }),
    [user, initializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
