import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Wraps user-only pages — redirects to /login if no token.
 * Renders null instantly (no flash) until auth is confirmed.
 */
const UserGuard = ({ children }) => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate, token]);

  // Render nothing until authenticated — prevents content flash
  if (!token) return null;

  return children;
};

export default UserGuard;
