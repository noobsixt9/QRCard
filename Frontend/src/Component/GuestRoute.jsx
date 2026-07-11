import { Navigate } from "react-router-dom";
import { getAuthSession, getDefaultRouteForRole } from "../utils/auth";

const GuestRoute = ({ children }) => {
  const session = getAuthSession();

  if (session?.token) {
    return <Navigate to={getDefaultRouteForRole(session.role)} replace />;
  }

  return children;
};

export default GuestRoute;
