import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import WaiterPOS from './pages/WaiterPOS';
import KitchenKDS from './pages/KitchenKDS';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth, homeForRole } from './auth/AuthContext';
import { ThemeProvider } from './ui/ThemeProvider';
import { ToastProvider } from './ui/Toast';
import Spinner from './ui/Spinner';

/** Sends a signed-in user to their role's home page, otherwise to login. */
function RootRedirect() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <Spinner size={32} className="text-brand" label="Loading" />
      </div>
    );
  }
  return <Navigate to={user ? homeForRole(user.role) : '/login'} replace />;
}

function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface text-center px-6 gap-4">
      <p className="text-6xl font-bold text-brand">404</p>
      <h1 className="text-2xl font-bold text-text">Page not found</h1>
      <p className="text-muted max-w-sm">
        That page doesn&apos;t exist. Head back and we&apos;ll take you to the
        right place.
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl
                   bg-brand text-brand-contrast font-semibold hover:bg-brand-hover
                   transition-colors focus-ring"
      >
        Go home
      </Link>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            {/* min-h-dvh rather than h-screen: dvh accounts for mobile browser
                chrome, and each page now owns its own scroll container. */}
            <div className="min-h-dvh bg-surface text-text font-sans">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<RootRedirect />} />

                <Route
                  path="/pos"
                  element={
                    <ProtectedRoute roles={['Waiter', 'Admin']}>
                      <WaiterPOS />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kitchen"
                  element={
                    <ProtectedRoute roles={['Chef', 'Admin']}>
                      <KitchenKDS />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['Admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
