import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import ConfirmModal from "../../Component/ConfirmModal";
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
  const [cancelTarget, setCancelTarget] = useState(null); // id to confirm cancel

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
    // Called after modal confirmation
    setCancelTarget(null);
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
    switch (status) {
      case "PENDING":    return "pending";
      case "CONFIRMED":  return "processing";
      case "PROCESSING": return "processing";
      case "DELIVERED":  return "processing";
      case "COMPLETED":  return "completed";
      case "CANCELLED":  return "cancelled";
      default:           return "pending";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED":  return "Confirmed";
      case "PROCESSING": return "Processing";
      case "DELIVERED":  return "Delivered";
      case "COMPLETED":  return "Completed";
      case "CANCELLED":  return "Cancelled";
      default: return status ? status.charAt(0) + status.slice(1).toLowerCase() : "—";
    }
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

        {error  && <div className="orders-notice error">{error}</div>}
        {notice && <div className="orders-notice success">{notice}</div>}

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
              <section className="order-detail-panel">
                <div className="order-detail-top">
                  <h2>Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</h2>
                  <button className="close-detail-btn" onClick={() => setSelectedOrder(null)}>
                    Close ×
                  </button>
                </div>

                <div className="order-detail-grid">
                  <div className="order-detail-item"><strong>QR Type</strong><p>{selectedOrder.qr_type}</p></div>
                  <div className="order-detail-item"><strong>Template</strong><p>{selectedOrder.design_config?.template || "Minimal"}</p></div>
                  <div className="order-detail-item"><strong>Quantity</strong><p>{selectedOrder.quantity} cards</p></div>
                  <div className="order-detail-item"><strong>Notes</strong><p>{selectedOrder.notes || "—"}</p></div>
                </div>

                <div style={{ marginBottom: "22px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Order Progress</p>

                  {selectedOrder.status === "CANCELLED" ? (
                    <div className="order-cancelled-notice">❌ This order has been cancelled.</div>
                  ) : (
                    <div className="progress-tracker">
                      {/* Step 1 — Pending (always active once created) */}
                      <div className="progress-step">
                        <div className="progress-circle active">1</div>
                        <span className="progress-label active">Pending</span>
                      </div>

                      <div className={["CONFIRMED","PROCESSING","DELIVERED","COMPLETED"].includes(selectedOrder.status) ? "progress-line active" : "progress-line"} />

                      {/* Step 2 — Confirmed */}
                      <div className="progress-step">
                        <div className={["CONFIRMED","PROCESSING","DELIVERED","COMPLETED"].includes(selectedOrder.status) ? "progress-circle active" : "progress-circle inactive"}>2</div>
                        <span className={["CONFIRMED","PROCESSING","DELIVERED","COMPLETED"].includes(selectedOrder.status) ? "progress-label active" : "progress-label"}>Confirmed</span>
                      </div>

                      <div className={["PROCESSING","DELIVERED","COMPLETED"].includes(selectedOrder.status) ? "progress-line active" : "progress-line"} />

                      {/* Step 3 — Processing */}
                      <div className="progress-step">
                        <div className={["PROCESSING","DELIVERED","COMPLETED"].includes(selectedOrder.status) ? "progress-circle active" : "progress-circle inactive"}>3</div>
                        <span className={["PROCESSING","DELIVERED","COMPLETED"].includes(selectedOrder.status) ? "progress-label active" : "progress-label"}>Processing</span>
                      </div>

                      <div className={["DELIVERED","COMPLETED"].includes(selectedOrder.status) ? "progress-line active" : "progress-line"} />

                      {/* Step 4 — Delivered */}
                      <div className="progress-step">
                        <div className={["DELIVERED","COMPLETED"].includes(selectedOrder.status) ? "progress-circle active" : "progress-circle inactive"}>4</div>
                        <span className={["DELIVERED","COMPLETED"].includes(selectedOrder.status) ? "progress-label active" : "progress-label"}>Delivered</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedOrder.status === "PENDING" && (
                  <button onClick={() => setCancelTarget(selectedOrder.id)} className="cancel-order-btn">
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
                                  style={{ background: "var(--danger-subtle)", color: "var(--danger)", borderColor: "rgba(239,68,68,0.2)" }}
                                  onClick={() => setCancelTarget(order.id)}
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
      <ConfirmModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => handleCancelOrder(cancelTarget)}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Yes, Cancel Order"
        isDestructive={true}
      />
    </div>
  );
};

export default Orders;