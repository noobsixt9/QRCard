import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ConfirmModal from "../ConfirmModal";
import "../../CSS/Admin/AdminDashboard.css";

const NAV_ITEMS = [
  { to: "/admin-dashboard", label: "Dashboard", icon: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></> },
  { to: "/admin-users",    label: "Users",    icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></> },
  { to: "/admin-profiles", label: "Profiles", icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
  { to: "/admin-orders",   label: "Orders",   icon: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></> },
  { to: "/admin-design-requests", label: "Design Requests", icon: <><circle cx="13.5" cy="6.5" r="2.5"/><path d="M3 19l5.5-5.5M9.5 10l9.5 9.5"/><path d="M15 9l-1.5 1.5"/></> },
  { to: "/admin-vendors",  label: "Vendors",  icon: <><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1"/><circle cx="7" cy="18" r="1"/><circle cx="18" cy="18" r="1"/></> },
  { to: "/admin-settings", label: "Settings", icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></> },
];

const AdminSidebar = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [adminUser, setAdminUser] = useState({ username: "Admin", email: "" });
  const navigate = useNavigate();

  const closeSidebar = () => setIsOpen(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u.username) setAdminUser(u);
    } catch (_) {}
  }, []);

  const initials = adminUser.username
    ? adminUser.username.slice(0, 2).toUpperCase()
    : "AD";

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="admin-mobile-topbar">
        <NavLink to="/admin-dashboard" className="admin-logo" style={{ marginBottom: 0 }}>
          <div className="admin-sidebar-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 18h3v3h-3zM18 14h3v3h-3z"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: 16, margin: 0 }}>QRCard</h2>
            <span style={{ fontSize: 10 }}>Admin Panel</span>
          </div>
        </NavLink>
        <button className="admin-hamburger" onClick={() => setIsOpen(true)} aria-label="Open menu">
          <span /><span />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && <div className="admin-sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`admin-sidebar${isOpen ? " admin-sidebar-open" : ""}`}>
        {/* Brand + close button */}
        <div className="admin-sidebar-brand-row">
          <NavLink to="/admin-dashboard" className="admin-logo" onClick={closeSidebar} style={{ marginBottom: 0 }}>
            <div className="admin-sidebar-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 18h3v3h-3zM18 14h3v3h-3z"/>
              </svg>
            </div>
            <div>
              <h2>QRCard</h2>
              <span>Admin Panel</span>
            </div>
          </NavLink>
          <button className="admin-sidebar-close" onClick={closeSidebar} aria-label="Close">×</button>
        </div>

        {/* Nav links */}
        <nav className="admin-menu">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `admin-link${isActive ? " active" : ""}`}
              onClick={closeSidebar}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
                {icon}
              </svg>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Admin user strip above logout */}
        <div className="admin-sidebar-footer">
          <div className="sidebar-user-strip">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{adminUser.username}</span>
              <span className="sidebar-user-role">Admin</span>
            </div>
          </div>

          <button type="button" className="admin-logout-btn" onClick={() => setIsLogoutModalOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Log Out"
        message="Are you sure you want to log out of the admin panel?"
        confirmText="Log Out"
        isDestructive={true}
      />
    </>
  );
};

export default AdminSidebar;
