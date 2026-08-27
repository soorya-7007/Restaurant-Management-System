import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChefHat,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, homeForRole } from '../auth/AuthContext';
import { errorMessage } from '../lib/api';
import Button from '../ui/Button';
import TextField from '../ui/TextField';
import ThemeToggle from '../ui/ThemeToggle';
import AmbientGlow from '../ui/AmbientGlow';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@demo.com', icon: ShieldCheck, tone: 'text-brand' },
  { role: 'Chef', email: 'chef@demo.com', icon: ChefHat, tone: 'text-warning' },
  { role: 'Waiter', email: 'waiter@demo.com', icon: UserRound, tone: 'text-info' },
];
const DEMO_PASSWORD = 'password123';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Already signed in — don't show the form again.
  if (user) return <Navigate to={homeForRole(user.role)} replace />;

  const validate = (emailValue, passwordValue) => {
    const errors = {};
    if (!emailValue.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue))
      errors.email = 'Enter a valid email address';
    if (!passwordValue) errors.password = 'Password is required';
    return errors;
  };

  const signIn = async (emailValue, passwordValue) => {
    const errors = validate(emailValue, passwordValue);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setError('');
    try {
      const signedIn = await login(emailValue, passwordValue);
      // Return them to whatever page sent them here, if any.
      const from = location.state?.from;
      navigate(from && from !== '/login' ? from : homeForRole(signedIn.role), {
        replace: true,
      });
    } catch (err) {
      setError(errorMessage(err, 'Failed to authenticate'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(email, password);
  };

  /** One tap to sign in as a demo role — previously this only filled the form. */
  const signInAs = (account) => {
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setFieldErrors({});
    signIn(account.email, DEMO_PASSWORD);
  };

  return (
    <div className="relative min-h-dvh flex items-center justify-center bg-surface px-4 py-8 overflow-hidden">
      <AmbientGlow />

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md bg-surface-raised border border-border
                   p-6 sm:p-9 rounded-3xl shadow-[var(--shadow-card)]"
      >
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-5"
            aria-hidden="true"
          >
            <ShieldCheck size={28} className="text-brand-contrast" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-1.5 tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted text-sm">Sign in to your restaurant workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && (
            <div
              role="alert"
              className="bg-danger-soft border border-danger/40 text-danger px-4 py-3 rounded-xl text-sm font-medium"
            >
              {error}
            </div>
          )}

          <TextField
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            /* eslint-disable-next-line jsx-a11y/no-autofocus */
            autoFocus
            icon={Mail}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: null }));
            }}
            placeholder="you@restaurant.com"
            error={fieldErrors.email}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            icon={Lock}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password)
                setFieldErrors((p) => ({ ...p, password: null }));
            }}
            placeholder="Enter your password"
            error={fieldErrors.password}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="p-2 text-subtle hover:text-text transition-colors focus-ring rounded-lg"
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            }
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
            icon={LogIn}
            className="mt-2"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="border-t border-border mt-7 pt-6">
          <p className="text-xs text-subtle mb-3 text-center uppercase tracking-wider font-semibold">
            Or try a demo account
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              return (
                <button
                  key={account.role}
                  type="button"
                  disabled={loading}
                  onClick={() => signInAs(account)}
                  className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border border-border
                             bg-surface hover:bg-surface-hover hover:border-border-strong
                             transition-colors focus-ring disabled:opacity-50 min-h-[44px]"
                >
                  <Icon size={18} className={account.tone} aria-hidden="true" />
                  <span className="text-xs font-semibold text-text">{account.role}</span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-subtle flex items-center justify-center gap-1.5">
          <KeyRound size={12} aria-hidden="true" /> Secured with encrypted access tokens
        </p>
      </motion.main>
    </div>
  );
}

export default Login;
