import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton } from './LoadingSkeleton';

export const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-repx-950 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-repx-900 border border-repx-volt/40 p-2 flex items-center justify-center shadow-volt-glow mb-4 animate-bounce">
          <img src="/logo.svg" alt="REPX" className="w-full h-full" />
        </div>
        <div className="text-sm font-bold font-display text-slate-300">
          Loading REPX Engine...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user registered but has not completed onboarding
  if (!user?.isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
