import { Navigate, useLocation } from "react-router-dom";
import {
  clearAuthSession,
  getAuthSession,
  getDefaultRouteForRole,
  isRoleAllowed,
} from "../utils/auth";

const ProtectedRoute = ({ children, roles = ["USER", "ADMIN"] }) => {
  const location = useLocation();
  const session = getAuthSession();

  if (!session?.token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!isRoleAllowed(session.role, roles)) {
    const fallback = getDefaultRouteForRole(session.role);

    if (location.pathname === fallback) {
      clearAuthSession();
      return <Navigate to="/login" replace />;
    }

    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
