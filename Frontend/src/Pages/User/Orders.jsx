import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/User/Orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const response = await fetch(`${API_URL}/orders`, {
          method: "GET",
          headers: getHeaders(),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to load orders");
        }

        setOrders(result.data || []);
      } catch (err) {
        console.error("Fetch orders error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderId = order.id || "";
      const template = order.design_config?.template || "";
      return (
        orderId.toLowerCase().includes(query.toLowerCase()) ||
        template.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [orders, query]);

  const handleCancelOrder = async (id) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this pending order?");
    if (!confirmCancel) return;

    try {
      setNotice("");
      const response = await fetch(`${API_URL}/orders/${id}/cancel`, {
        method: "PATCH",
        headers: getHeaders(),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to cancel order");
      }

      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status: "CANCELLED" } : order))
      );
      setNotice("Order cancelled successfully.");
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => ({ ...prev, status: "CANCELLED" }));
      }
    } catch (err) {
      console.error("Cancel order error:", err.message);
      setNotice(err.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return "pending";
    const lower = status.toLowerCase();
    if (lower === "pending") return "pending";
    if (lower === "confirmed") return "processing";
    if (lower === "completed") return "completed";
    if (lower === "cancelled") return "cancelled";
    return "pending";
  };

  const getStatusText = (status) => {
    if (status === "CONFIRMED") return "Processing";
    return status?.charAt(0) + status?.slice(1).toLowerCase();
  };

  return (
    <div className="my-orders-page">
      <Sidebar />

      <main className="my-orders-main">
        <div className="my-orders-header">
          <div>
            <h1>My Orders</h1>
            <p>View and manage your visiting card printing orders.</p>
          </div>

          <Link to="/printing-order" className="new-order-btn">
            New Order
          </Link>
        </div>

        {error && <div className="admin-form-message error-message">{error}</div>}
        {notice && <div className="admin-form-message" style={{ color: "var(--primary-color)", margin: "10px 0" }}>{notice}</div>}

        {loading ? (
          <div className="dashboard-loading" style={{ padding: "40px 0", textAlign: "center" }}>
            <p>Loading your printing orders...</p>
          </div>
        ) : (
          <>
            <section className="order-stats-grid">
              <div className="order-stat-card">
                <p>Total Orders</p>
                <h2>{orders.length}</h2>
              </div>

              <div className="order-stat-card">
                <p>Pending</p>
                <h2 className="pending-number">{orders.filter((o) => o.status === "PENDING").length}</h2>
              </div>

              <div className="order-stat-card">
                <p>Processing</p>
                <h2 className="processing-number">{orders.filter((o) => o.status === "CONFIRMED").length}</h2>
              </div>

              <div className="order-stat-card">
                <p>Completed</p>
                <h2 className="completed-number">{orders.filter((o) => o.status === "COMPLETED").length}</h2>
              </div>
            </section>

            {selectedOrder && (
              <section className="recent-orders-card" style={{ border: "1px solid var(--primary-color)", marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "20px" }}>
                  <h2 style={{ margin: 0 }}>Order Details: #{selectedOrder.id.slice(0, 8).toUpperCase()}</h2>
                  <button
                    className="view-details-btn"
                    onClick={() => setSelectedOrder(null)}
                    style={{ marginLeft: "auto" }}
                  >
                    Close Details
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                  <div>
                    <strong>QR Type:</strong>
                    <p style={{ margin: "4px 0" }}>{selectedOrder.qr_type}</p>
                  </div>
                  <div>
                    <strong>Template:</strong>
                    <p style={{ margin: "4px 0" }}>{selectedOrder.design_config?.template || "Minimal"}</p>
                  </div>
                  <div>
                    <strong>Quantity:</strong>
                    <p style={{ margin: "4px 0" }}>{selectedOrder.quantity} cards</p>
                  </div>
                  <div>
                    <strong>Notes:</strong>
                    <p style={{ margin: "4px 0" }}>{selectedOrder.notes || "None"}</p>
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <strong style={{ display: "block", marginBottom: "14px" }}>Order Progress:</strong>
                  
                  {selectedOrder.status === "CANCELLED" ? (
                    <div style={{ color: "var(--red)", fontWeight: "bold" }}>
                      ❌ This order has been cancelled.
                    </div>
                  ) : (
                    <div className="progress-tracker">
                      <div className="progress-step">
                        <div className="progress-circle active">1</div>
                        <span className="progress-label active">Pending</span>
                      </div>
                      
                      <div className={["CONFIRMED", "COMPLETED"].includes(selectedOrder.status) ? "progress-line active" : "progress-line"}></div>

                      <div className="progress-step">
                        <div className={["CONFIRMED", "COMPLETED"].includes(selectedOrder.status) ? "progress-circle active" : "progress-circle inactive"}>2</div>
                        <span className={["CONFIRMED", "COMPLETED"].includes(selectedOrder.status) ? "progress-label active" : "progress-label"}>Processing</span>
                      </div>

                      <div className={selectedOrder.status === "COMPLETED" ? "progress-line active" : "progress-line"}></div>

                      <div className="progress-step">
                        <div className={selectedOrder.status === "COMPLETED" ? "progress-circle active" : "progress-circle inactive"}>3</div>
                        <span className={selectedOrder.status === "COMPLETED" ? "progress-label active" : "progress-label"}>Delivered</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedOrder.status === "PENDING" && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="view-details-btn"
                    style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}
                  >
                    Cancel Order
                  </button>
                )}
              </section>
            )}

            <section className="recent-orders-card">
              <div className="recent-orders-header">
                <h2>Recent Orders</h2>
                <input
                  type="text"
                  placeholder="Search order by template..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="orders-table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Template</th>
                      <th>Quantity</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                          No orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id.slice(0, 8).toUpperCase()}</td>
                          <td>{order.design_config?.template || "Minimal"}</td>
                          <td>{order.quantity}</td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                className="view-details-btn"
                                onClick={() => setSelectedOrder(order)}
                              >
                                View
                              </button>
                              {order.status === "PENDING" && (
                                <button
                                  className="view-details-btn"
                                  onClick={() => handleCancelOrder(order.id)}
                                  style={{ color: "#dc2626" }}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Orders;