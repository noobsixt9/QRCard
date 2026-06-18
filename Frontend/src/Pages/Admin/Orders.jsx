import { useMemo, useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import "../../CSS/Admin/AdminPages.css";

const AdminOrders = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState("");

  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      customer: "Alina Khatun",
      email: "alina@gmail.com",
      quantity: "100 cards",
      paper: "Standard Matte",
      status: "Pending",
      date: "17 Jun 2026",
    },
    {
      id: "ORD-002",
      customer: "Salina Basnet",
      email: "salina@gmail.com",
      quantity: "200 cards",
      paper: "Premium Glossy",
      status: "Processing",
      date: "16 Jun 2026",
    },
    {
      id: "ORD-003",
      customer: "Rabim Karki",
      email: "rabim@gmail.com",
      quantity: "100 cards",
      paper: "Standard Matte",
      status: "Sent to Vendor",
      date: "15 Jun 2026",
    },
    {
      id: "ORD-004",
      customer: "Kamal Kunwar",
      email: "kamal@gmail.com",
      quantity: "500 cards",
      paper: "Premium Matte",
      status: "Completed",
      date: "14 Jun 2026",
    },
  ]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(query.toLowerCase()) ||
        order.customer.toLowerCase().includes(query.toLowerCase()) ||
        order.email.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        order.status.toLowerCase().replaceAll(" ", "-") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, query, statusFilter]);

  const updateStatus = (id, status) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order))
    );

    setNotice(`${id} status updated to ${status}.`);
  };

  const getStatusClass = (status) => {
    if (status === "Pending") return "pending";
    if (status === "Processing") return "processing";
    if (status === "Sent to Vendor") return "vendor";
    if (status === "Completed") return "completed";
    return "pending";
  };

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-page-main">
        <header className="admin-page-header">
          <div>
            <h1>Printing Orders</h1>
            <p>Manage QR visiting card printing requests and order status.</p>
          </div>

          <div className="admin-page-header-actions">
            <button
              type="button"
              className="admin-btn primary"
              onClick={() => setNotice("Order list refreshed.")}
            >
              Refresh Orders
            </button>
          </div>
        </header>

        <section className="admin-mini-stats">
          <div className="admin-mini-card">
            <p>Total Orders</p>
            <h2>{orders.length}</h2>
            <span className="text-blue">Print requests</span>
          </div>

          <div className="admin-mini-card">
            <p>Pending</p>
            <h2>{orders.filter((o) => o.status === "Pending").length}</h2>
            <span className="text-orange">Need review</span>
          </div>

          <div className="admin-mini-card">
            <p>Processing</p>
            <h2>{orders.filter((o) => o.status === "Processing").length}</h2>
            <span className="text-purple">Being prepared</span>
          </div>

          <div className="admin-mini-card">
            <p>Completed</p>
            <h2>{orders.filter((o) => o.status === "Completed").length}</h2>
            <span className="text-green">Delivered</span>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-title">
            <div>
              <h2>All Printing Orders</h2>
              <p>View order quantity, paper type, customer, and status.</p>
            </div>
          </div>

          <div className="admin-toolbar">
            <div className="admin-search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search by order ID, customer, or email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <select
              className="admin-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="sent-to-vendor">Sent to Vendor</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Paper Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {order.customer
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <strong>{order.customer}</strong>
                          <span>{order.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{order.quantity}</td>
                    <td>{order.paper}</td>
                    <td>
                      <span className={`admin-pill ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.date}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="admin-icon-action"
                          onClick={() => setNotice(`Viewing #${order.id}.`)}
                        >
                          View
                        </button>

                        <button
                          className="admin-icon-action"
                          onClick={() => updateStatus(order.id, "Processing")}
                        >
                          Process
                        </button>

                        <button
                          className="admin-icon-action"
                          onClick={() => updateStatus(order.id, "Sent to Vendor")}
                        >
                          Vendor
                        </button>

                        <button
                          className="admin-icon-action"
                          onClick={() => updateStatus(order.id, "Completed")}
                        >
                          Done
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {notice && <p className="admin-form-message">{notice}</p>}
        </section>
      </main>
    </div>
  );
};

export default AdminOrders;