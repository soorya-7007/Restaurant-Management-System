import axios from 'axios';
import { STORAGE_KEYS } from './constants';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SOCKET_URL = API_BASE_URL;

const api = axios.create({ baseURL: `${API_BASE_URL}/api` });

/** Attaches the JWT to every outgoing request. */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
}

/**
 * Lets AuthContext hook its own state reset into the 401 handler, so an
 * expired token clears React state as well as localStorage.
 */
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

/**
 * The JWT expires after a day. Without this, the app just started failing
 * requests silently instead of returning the user to the login screen.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      clearSession();
      if (onUnauthorized) {
        onUnauthorized();
      } else if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

/** Pulls a human-readable message out of an axios error. */
export function errorMessage(error, fallback = 'Something went wrong') {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.code === 'ERR_NETWORK') {
    return 'Cannot reach the server. Check that the API is running.';
  }
  return error?.message || fallback;
}

export default api;
