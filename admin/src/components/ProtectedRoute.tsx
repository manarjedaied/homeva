import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { adminAPI } from "../services/api";
import Auth from "../utils/storage";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = Auth.getToken();
  const refresh = Auth.getRefresh();

  // Si pas connecté → redirect
  if (!token) return <Navigate to="/admin/login" replace />;

  // Check expiration
  if (!Auth.isAuthenticated()) {
    // Token expiré → essayer refresh
    if (!refresh) return <Navigate to="/admin/login" replace />;

   return <RefreshWrapper refreshToken={refresh}>{children}</RefreshWrapper>;

  }

  return <>{children}</>;
};

// ------------------------------------------------------
// Auto-refresh token wrapper
// ------------------------------------------------------
// Appel du wrapper

// Wrapper
const RefreshWrapper = ({ refreshToken, children }: any) => {
  const navigate = useNavigate();
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    const refreshTokenFunc = async () => {
      try {
        const res = await adminAPI.refresh(refreshToken);
        Auth.setSession((res as { accessToken: string }).accessToken, refreshToken);
        setDone(true);
      } catch {
        Auth.clear();
        navigate("/admin/login");
      }
    };
    refreshTokenFunc();
  }, [refreshToken, navigate]);

  if (!done) return <div>Loading...</div>;
  return children;
};

