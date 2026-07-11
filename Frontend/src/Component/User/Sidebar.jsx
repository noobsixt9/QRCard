import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../utils/auth";
import "../../CSS/User/Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");

    if (!confirmLogout) return;

    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {!isOpen && (
        <button className="mobile-menu-btn" onClick={() => setIsOpen(true)}>
          ☰
        </button>
      )}

      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <NavLink to="/" className="sidebar-logo" onClick={closeSidebar}>
          QR CARD
        </NavLink>

        <nav className="sidebar-menu">
          <NavLink to="/dashboard" className="sidebar-link" onClick={closeSidebar}>
            Dashboard
          </NavLink>

          <NavLink to="/digital-profile" className="sidebar-link" onClick={closeSidebar}>
            My Profile
          </NavLink>

          <NavLink to="/qr-codes" className="sidebar-link" onClick={closeSidebar}>
            QR Codes
          </NavLink>

          <NavLink to="/ai-bio" className="sidebar-link" onClick={closeSidebar}>
            AI Bio
          </NavLink>

          <NavLink to="/card-design" className="sidebar-link" onClick={closeSidebar}>
            Card Design
          </NavLink>

          <NavLink to="/orders" className="sidebar-link" onClick={closeSidebar}>
            Orders
          </NavLink>

          <NavLink to="/settings" className="sidebar-link" onClick={closeSidebar}>
            Settings
          </NavLink>
          
        </nav>
        

        <button type="button" className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>

        <button className="sidebar-close-btn" onClick={closeSidebar}>
          ×
        </button>
      </aside>
    </>
  );
};

export default Sidebar;