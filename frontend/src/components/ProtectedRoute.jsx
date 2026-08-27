import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, homeForRole } from '../auth/AuthContext';
import Spinner from '../ui/Spinner';

/**
 * Replaces the four repeated inline role ternaries in App.jsx.
 *
 * A signed-in user who hits a page above their role is sent to their own home
 * page rather than to /login, which previously looked like being logged out.
 */
function ProtectedRoute({ roles, children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <Spinner size={32} className="text-brand" label="Restoring your session" />
      </div>
    );
  }

  if (!user) {
    // Remember where they were headed so login can return them there.
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
