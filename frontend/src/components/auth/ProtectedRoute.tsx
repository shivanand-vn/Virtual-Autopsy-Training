import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAuthToken, getStoredUser } from '../../lib/api';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: ('ADMIN' | 'STUDENT' | 'PENDING_APPROVAL')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  const storedToken = getAuthToken();
  const storedUser = getStoredUser();

  // Guard against browser bfcache (Back/Forward Cache) and history navigation after logout
  useEffect(() => {
    const verifyAuth = () => {
      const activeToken = getAuthToken();
      const activeUser = getStoredUser();
      if (!activeToken || !activeUser) {
        // Force complete page reload to login if cache/history restored unauthorized state
        window.location.replace('/login');
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      // event.persisted is true when restored from bfcache
      if (event.persisted) {
        verifyAuth();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', verifyAuth);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', verifyAuth);
    };
  }, []);

  // While initializing authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-bold text-slate-300 tracking-wider uppercase">
            Verifying Security Session...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated: Immediately redirect to login with replace
  if (!user || !token || !storedToken || !storedUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role check: If student tries to visit admin routes, redirect to student dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

interface PublicOnlyRouteProps {
  children: React.ReactElement;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { user, token, isLoading } = useAuth();
  const storedToken = getAuthToken();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-bold text-slate-300 tracking-wider uppercase">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If already authenticated, redirect to appropriate portal
  if (user && token && storedToken) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
