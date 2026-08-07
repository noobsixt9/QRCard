import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Wraps admin pages — redirects to /admin if no token or role !== ADMIN.
 */
const AdminGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role  = (localStorage.getItem("userRole") || "").toUpperCase();

    if (!token || role !== "ADMIN") {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  // Render nothing until the effect has run (avoids flash of admin content)
  const token = localStorage.getItem("token");
  const role  = (localStorage.getItem("userRole") || "").toUpperCase();
  if (!token || role !== "ADMIN") return null;

  return children;
};

export default AdminGuard;
