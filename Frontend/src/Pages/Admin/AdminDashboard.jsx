import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/Admin/AdminDashboard.css";

const STAT_ICONS = {
  users:   <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  active:  <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  orders:  <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
  pending: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
};

const ACTION_ITEMS = [
  { label: "Manage Users",     to: "/admin-users",            icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></> },
  { label: "Manage Orders",    to: "/admin-orders",           icon: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></> },
  { label: "Design Requests",  to: "/admin-design-requests",  icon: <><circle cx="13.5" cy="6.5" r="2.5"/><path d="M3 19l5.5-5.5"/></> },
  { label: "Manage Vendors",   to: "/admin-vendors",          icon: <><rect x="1" y="3" width="15" height="13" rx="2"/><circle cx="7" cy="18" r="1"/><circle cx="18" cy="18" r="1"/></> },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res    = await fetch(`${API_URL}/admin/dashboard`, { headers: getHeaders() });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to load dashboard");
        setStats(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalOrders  = stats?.orders
    ? (stats.orders.pending || 0) + (stats.orders.confirmed || 0) +
      (stats.orders.completed || 0) + (stats.orders.cancelled || 0)
    : 0;

  const recentOrders = stats?.recent_orders || [];

  const getStatusClass = (s) => {
    switch (s) {
      case "PENDING":    return "pending";
      case "CONFIRMED":  return "processing";
      case "PROCESSING": return "processing";
      case "DELIVERED":  return "processing";
      case "COMPLETED":  return "completed";
      case "CANCELLED":  return "cancelled";
      default:           return "pending";
    }
  };

  const getStatusLabel = (s) => {
    if (!s) return "—";
    if (s === "CONFIRMED") return "Confirmed";
    return s.charAt(0) + s.slice(1).toLowerCase();
  };

  return (
    <div className="admin-dashboard-page">
      <AdminSidebar />

      <main className="admin-main">
        {/* Header — no user chip, it lives in sidebar */}
        <div className="admin-header">
          <div className="admin-header-left">
            <h1>Admin Dashboard</h1>
            <p>Manage users, profiles, printing orders, and design requests.</p>
          </div>
        </div>

        {error && <div className="au-notice error" style={{ marginBottom: 24 }}>{error}</div>}

        {loading ? (
          <div className="admin-loading"><div className="spinner" /><p>Loading metrics…</p></div>
        ) : (
          <>
            {/* ── Stat cards ── */}
            <section className="admin-stats-grid">
              {[
                { key: "users",   label: "Total Users",    value: stats?.total_users ?? 0,        sub: "Registered users",  color: "blue-text",   icon: STAT_ICONS.users,   to: "/admin-users" },
                { key: "active",  label: "Active Users",   value: stats?.active_users ?? 0,       sub: "Active accounts",   color: "green-text",  icon: STAT_ICONS.active,  to: "/admin-profiles" },
                { key: "orders",  label: "Total Orders",   value: totalOrders,                    sub: "Print requests",    color: "purple-text", icon: STAT_ICONS.orders,  to: "/admin-orders" },
                { key: "pending", label: "Pending Orders", value: stats?.orders?.pending ?? 0,    sub: "Needs action",      color: "orange-text", icon: STAT_ICONS.pending, to: "/admin-orders" },
              ].map(({ key, label, value, sub, color, icon, to }) => (
                <button key={key} type="button" className="admin-stat-card" onClick={() => navigate(to)}>
                  <div className="asc-top">
                    <p>{label}</p>
                    <div className={`asc-icon asc-icon-${key}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">{icon}</svg>
                    </div>
                  </div>
                  <h2>{value}</h2>
                  <span className={color}>{sub}</span>
                </button>
              ))}
            </section>

            <section className="admin-content-grid">
              {/* ── Recent orders table ── */}
              <div className="recent-printing-card">
                <div className="admin-card-title-row">
                  <div>
                    <h2>Recent Printing Orders</h2>
                    <p>Latest printing requests from users</p>
                  </div>
                  <button type="button" className="admin-view-all-btn" onClick={() => navigate("/admin-orders")}>
                    View All →
                  </button>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: "center", padding: "28px", color: "var(--text-tertiary)" }}>No recent orders.</td></tr>
                      ) : (
                        recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td style={{ fontFamily: "'Space Grotesk', monospace", fontWeight: 700 }}>
                              #{order.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td>
                              <div className="admin-user-cell">
                                <div className="admin-user-avatar">
                                  {(order.user?.username || "U").slice(0, 2).toUpperCase()}
                                </div>
                                <span>{order.user?.username || order.user?.email || "Unknown"}</span>
                              </div>
                            </td>
                            <td>{order.quantity} cards</td>
                            <td>
                              <span className={`admin-status ${getStatusClass(order.status)}`}>
                                {getStatusLabel(order.status)}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="admin-icon-action"
                                onClick={() => navigate("/admin-orders")}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Quick actions ── */}
              <aside className="quick-admin-card">
                <h3 className="quick-admin-title">Quick Actions</h3>

                <div className="admin-action-list">
                  {ACTION_ITEMS.map(({ label, to, icon }) => (
                    <button key={to} type="button" className="admin-action-btn" onClick={() => navigate(to)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">{icon}</svg>
                      {label}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ marginLeft: "auto", opacity: 0.4 }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  ))}
                </div>

                {stats?.orders?.pending > 0 && (
                  <button type="button" className="admin-warning-box" onClick={() => navigate("/admin-orders")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    {stats.orders.pending} order{stats.orders.pending > 1 ? "s" : ""} need{stats.orders.pending === 1 ? "s" : ""} review
                  </button>
                )}
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
