import React from 'react';
import { Navigate } from 'react-router-dom';
import { adminStorage } from '../utils/storage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // En mode développement, auto-login avec compte statique si non authentifié
  if (import.meta.env.DEV && !adminStorage.isAuthenticated()) {
    adminStorage.setToken('dev_admin_token');
    adminStorage.setEmail('admin@homeva.com');
  }

  if (!adminStorage.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

