import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../CSS/Admin/AdminDashboard.css";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    sessionStorage.clear();

    navigate("/login");
  };

  return (
    <aside className="admin-sidebar">
      <NavLink to="/" end className="admin-logo">
        <h2>Admin</h2>
        <h2>QRCard</h2>
      </NavLink>

      <nav className="admin-menu">
        <NavLink to="/admin-dashboard" className="admin-link">
          <i className="bi bi-grid-fill"></i>
          Dashboard
        </NavLink>

        <NavLink to="/admin-users" className="admin-link">
          <i className="bi bi-people-fill"></i>
          Users
        </NavLink>

        <NavLink to="/admin-profiles" className="admin-link">
          <i className="bi bi-person-vcard-fill"></i>
          Profiles
        </NavLink>

        <NavLink to="/admin-orders" className="admin-link">
          <i className="bi bi-bag-check-fill"></i>
          Orders
        </NavLink>

        <NavLink to="/admin-design-requests" className="admin-link">
          <i className="bi bi-palette-fill"></i>
          Design Requests
        </NavLink>

        <NavLink to="/admin-vendors" className="admin-link">
          <i className="bi bi-truck"></i>
          Vendors
        </NavLink>

        <NavLink to="/admin-settings" className="admin-link">
          <i className="bi bi-gear-fill"></i>
          Settings
        </NavLink>
      </nav>

      <button type="button" className="admin-logout-btn" onClick={handleLogout}>
        <i className="bi bi-box-arrow-right"></i>
        Log Out
      </button>
    </aside>
  );
};

export default AdminSidebar;