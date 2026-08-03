import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAuthSession } from "../../utils/auth";
import ConfirmModal from "../ConfirmModal";
import logo from "../../assets/qr-card-logo.png";
import "../../CSS/User/Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {!isOpen && (
        <div className="mobile-top-bar">
          <NavLink to="/dashboard" className="mobile-logo-link">
            <img src={logo} alt="QR Card" className="mobile-logo-img" />
          </NavLink>
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Open Menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
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
        

        <button type="button" className="logout-btn" onClick={handleLogoutClick}>
          Log Out
        </button>

        <button className="sidebar-close-btn" onClick={closeSidebar}>
          ×
        </button>
      </aside>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        isDestructive={true}
      />
    </>
  );
};

export default Sidebar;