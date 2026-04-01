import React, { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { hasAdminAccess } from "../lib/adminAccess";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      if (!currentUser) {
        setIsAdmin(false);
        setCheckingAccess(false);
        return;
      }

      setCheckingAccess(true);
      const allowed = await hasAdminAccess(currentUser);

      if (!cancelled) {
        setIsAdmin(allowed);
        setCheckingAccess(false);
      }
    }

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-main mb-2">Access Denied</h1>
          <p className="text-muted mb-4">You do not have admin privileges.</p>
          <a href="/" className="text-primary hover:underline">
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
