import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ConfirmModal from "../ConfirmModal";
import "../../CSS/User/Sidebar.css";

const NAV_ITEMS = [
  {
    group: "NAVIGATION",
    items: [
      { to: "/dashboard",       label: "Dashboard",    icon: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></> },
      { to: "/digital-profile", label: "My Profile",   icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
      { to: "/qr-codes",        label: "QR Codes",     icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 18h3v3h-3zM18 14h3v3h-3z"/></> },
    ],
  },
  {
    group: "PRINT",
    items: [
      { to: "/card-design",     label: "Card Design",  icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></> },
      { to: "/orders",          label: "Orders",       icon: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></> },
    ],
  },
  {
    group: null,
    items: [
      { to: "/settings", label: "Settings", icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></> },
    ],
  },
];

const Sidebar = () => {
  const [isOpen, setIsOpen]         = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch (_) {}
  }, []);

  const username = currentUser?.username || "";
  const initials = username
    ? username.split("_").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const role = currentUser?.role === "ADMIN" ? "Admin" : "User";

  const closeSidebar = () => setIsOpen(false);

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-top-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="brand-icon-box">QR</div>
          <span className="brand-title">QRCARD</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {username && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className="sidebar-user-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{initials}</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{username}</span>
            </div>
          )}
          <button className="mobile-menu-btn" onClick={() => setIsOpen(true)} aria-label="Open menu">
            <span /><span />
          </button>
        </div>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <NavLink to="/" className="sidebar-logo" onClick={closeSidebar}>
            <div className="brand-icon-box">QR</div>
            <span className="brand-title">QRCARD</span>
          </NavLink>
          <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Close">×</button>
        </div>

        {/* Nav */}
        <nav className="sidebar-menu">
          {NAV_ITEMS.map(({ group, items }) => (
            <div key={group || "misc"}>
              {group && <div className="menu-group-label">{group}</div>}
              {items.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                  onClick={closeSidebar}
                >
                  <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    {icon}
                  </svg>
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User profile strip + logout pinned to bottom */}
        <div className="sidebar-footer">
          {username && (
            <div className="sidebar-user-strip">
              <div className="sidebar-user-avatar">{initials}</div>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{username}</span>
                <span className="sidebar-user-role">{role}</span>
              </div>
            </div>
          )}
          <button type="button" className="logout-btn" onClick={() => setShowLogout(true)}>
            <svg className="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleConfirmLogout}
        title="Log Out"
        message="Are you sure you want to end your session?"
        confirmText="Log Out"
        isDestructive={true}
      />
    </>
  );
};

export default Sidebar;
