import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import "../../CSS/Admin/AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const recentOrders = [
    {
      id: "ORD-001",
      displayId: "#ORD-001",
      customer: "Alina Khatun",
      quantity: "100 cards",
      status: "Pending",
      statusClass: "pending",
    },
    {
      id: "ORD-002",
      displayId: "#ORD-002",
      customer: "Salina Basnet",
      quantity: "200 cards",
      status: "Processing",
      statusClass: "processing",
    },
    {
      id: "ORD-003",
      displayId: "#ORD-003",
      customer: "Rabim Karki",
      quantity: "100 cards",
      status: "Sent to vendor",
      statusClass: "vendor",
    },
    {
      id: "ORD-004",
      displayId: "#ORD-004",
      customer: "Kamal Kunwar",
      quantity: "500 cards",
      status: "Completed",
      statusClass: "completed",
    },
  ];

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

        <section className="admin-stats-grid">
          <button
            type="button"
            className="admin-stat-card"
            onClick={() => navigate("/admin-users")}
          >
            <p>Total Users</p>
            <h2>125</h2>
            <span className="blue-text">Registered users</span>
          </button>

          <button
            type="button"
            className="admin-stat-card"
            onClick={() => navigate("/admin-profiles")}
          >
            <p>Total Profiles</p>
            <h2>98</h2>
            <span className="green-text">Active profiles</span>
          </button>

          <button
            type="button"
            className="admin-stat-card"
            onClick={() => navigate("/admin-orders")}
          >
            <p>Total Orders</p>
            <h2>42</h2>
            <span className="purple-text">Print requests</span>
          </button>

          <button
            type="button"
            className="admin-stat-card"
            onClick={() => navigate("/admin-orders")}
          >
            <p>Pending Orders</p>
            <h2>8</h2>
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
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.displayId}</td>
                    <td>{order.customer}</td>
                    <td>{order.quantity}</td>
                    <td>
                      <span className={`admin-status ${order.statusClass}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin-orders/${order.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
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

            <button
              type="button"
              className="admin-warning-box"
              onClick={() => navigate("/admin-orders")}
            >
              8 orders need admin review.
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;