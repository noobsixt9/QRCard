import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/Admin/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/dashboard`, {
          method: "GET",
          headers: getHeaders(),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to load dashboard data");
        }

        setStats(result.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalOrders = stats?.orders
    ? (stats.orders.pending || 0) +
      (stats.orders.confirmed || 0) +
      (stats.orders.completed || 0) +
      (stats.orders.cancelled || 0)
    : 0;

  const recentOrders = stats?.recent_orders || [];

  const getStatusClass = (status) => {
    if (!status) return "pending";
    const lower = status.toLowerCase();
    if (lower === "pending") return "pending";
    if (lower === "confirmed") return "processing";
    if (lower === "completed") return "completed";
    if (lower === "cancelled") return "cancelled";
    return "pending";
  };

  return (
    <div className="admin-dashboard-page">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage users, profiles, printing orders, and design requests</p>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">AD</div>
            <div>
              <h4>Admin</h4>
              <span>System Admin</span>
            </div>
          </div>
        </div>

        {error && <div className="admin-form-message error-message">{error}</div>}

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading dashboard metrics...</p>
          </div>
        ) : (
          <>
            <section className="admin-stats-grid">
              <button
                type="button"
                className="admin-stat-card"
                onClick={() => navigate("/admin-users")}
              >
                <p>Total Users</p>
                <h2>{stats?.total_users ?? 0}</h2>
                <span className="blue-text">Registered users</span>
              </button>

              <button
                type="button"
                className="admin-stat-card"
                onClick={() => navigate("/admin-profiles")}
              >
                <p>Active Users</p>
                <h2>{stats?.active_users ?? 0}</h2>
                <span className="green-text">Active accounts</span>
              </button>

              <button
                type="button"
                className="admin-stat-card"
                onClick={() => navigate("/admin-orders")}
              >
                <p>Total Orders</p>
                <h2>{totalOrders}</h2>
                <span className="purple-text">Print requests</span>
              </button>

              <button
                type="button"
                className="admin-stat-card"
                onClick={() => navigate("/admin-orders")}
              >
                <p>Pending Orders</p>
                <h2>{stats?.orders?.pending ?? 0}</h2>
                <span className="orange-text">Needs action</span>
              </button>
            </section>

            <section className="admin-content-grid">
              <div className="recent-printing-card">
                <div className="admin-card-title-row">
                  <div>
                    <h2>Recent Printing Orders</h2>
                    <p>Latest printing requests from users</p>
                  </div>

                  <button
                    type="button"
                    className="admin-view-all-btn"
                    onClick={() => navigate("/admin-orders")}
                  >
                    View All
                  </button>
                </div>

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
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                          No recent orders found.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id.slice(0, 8).toUpperCase()}</td>
                          <td>{order.user?.username || order.user?.email || "Unknown"}</td>
                          <td>{order.quantity} cards</td>
                          <td>
                            <span className={`admin-status ${getStatusClass(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
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

              <aside className="quick-admin-card">
                <h2>Quick Admin Actions</h2>

                <div className="admin-action-list">
                  <button
                    type="button"
                    className="active"
                    onClick={() => navigate("/admin-users")}
                  >
                    Manage Users
                  </button>

                  <button type="button" onClick={() => navigate("/admin-orders")}>
                    Manage Orders
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/admin-design-requests")}
                  >
                    Design Requests
                  </button>

                  <button type="button" onClick={() => navigate("/admin-vendors")}>
                    Manage Vendors
                  </button>
                </div>

                {stats?.orders?.pending > 0 && (
                  <button
                    type="button"
                    className="admin-warning-box"
                    onClick={() => navigate("/admin-orders")}
                  >
                    {stats.orders.pending} orders need admin review.
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