import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/Admin/AdminPages.css";

const AdminOrders = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderForVendor, setSelectedOrderForVendor] = useState(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchOrdersAndVendors = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch Orders
        const ordersRes = await fetch(`${API_URL}/admin/orders`, {
          method: "GET",
          headers: getHeaders(),
        });
        const ordersResult = await ordersRes.json();
        if (!ordersRes.ok) {
          throw new Error(ordersResult.message || "Failed to load orders");
        }
        setOrders(ordersResult.data || []);

        // Fetch Vendors
        const vendorsRes = await fetch(`${API_URL}/admin/vendors`, {
          method: "GET",
          headers: getHeaders(),
        });
        const vendorsResult = await vendorsRes.json();
        if (vendorsRes.ok) {
          setVendors(vendorsResult.data || []);
        }
      } catch (err) {
        console.error("Fetch orders/vendors error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndVendors();
  }, [refreshTrigger]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderId = order.id || "";
      const customerName = order.user?.username || order.user?.email || "";
      const customerEmail = order.user?.email || "";

      const matchesSearch =
        orderId.toLowerCase().includes(query.toLowerCase()) ||
        customerName.toLowerCase().includes(query.toLowerCase()) ||
        customerEmail.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        order.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, query, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      setNotice("");
      const response = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update order status");
      }

      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status } : order))
      );

      setNotice(`Order #${id.slice(0, 8).toUpperCase()} updated to ${status}.`);
    } catch (err) {
      console.error("Update status error:", err.message);
      setNotice(err.message);
    }
  };

  const handleSendToVendor = async (orderId, vendorId) => {
    if (!vendorId) return;
    try {
      setNotice("");
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/send-to-vendor`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ vendor_id: vendorId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to send order to vendor");
      }

      // Update state locally
      // Backend auto-sets status to PROCESSING on vendor assignment
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, vendor_id: vendorId, status: "PROCESSING" } : order
        )
      );

      setNotice(`Order assigned to vendor and status set to Processing.`);
      setSelectedOrderForVendor(null);
    } catch (err) {
      console.error("Send to vendor error:", err.message);
      setNotice(err.message);
    }
  };

  const getStatusClass = (status) => {
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

  const getStatusLabel = (status) => {
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
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
            >
              Refresh Orders
            </button>
          </div>
        </header>

        {error  && <div className="au-notice error"   style={{ marginBottom: 20 }}>{error}</div>}
        {notice && <div className="au-notice success" style={{ marginBottom: 20 }}>{notice}<button onClick={() => setNotice("")} style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"inherit",fontSize:16 }}>×</button></div>}

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading printing orders...</p>
          </div>
        ) : (
          <>
            <section className="admin-mini-stats">
              <div className="admin-mini-card">
                <p>Total Orders</p>
                <h2>{orders.length}</h2>
                <span className="text-blue">Print requests</span>
              </div>

              <div className="admin-mini-card">
                <p>Pending</p>
                <h2>{orders.filter((o) => o.status === "PENDING").length}</h2>
                <span className="text-orange">Need review</span>
              </div>

              <div className="admin-mini-card">
                <p>In Progress</p>
                <h2>{orders.filter((o) => ["CONFIRMED","PROCESSING","DELIVERED"].includes(o.status)).length}</h2>
                <span className="text-purple">Being prepared</span>
              </div>

              <div className="admin-mini-card">
                <p>Completed</p>
                <h2>{orders.filter((o) => o.status === "COMPLETED").length}</h2>
                <span className="text-green">Delivered</span>
              </div>
            </section>

            {selectedOrderForVendor && (
              <div className="admin-panel" style={{ border: "1px solid var(--primary-color)" }}>
                <h3>Assign Vendor for Order #{selectedOrderForVendor.slice(0, 8).toUpperCase()}</h3>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px", alignItems: "center" }}>
                  <select
                    id="vendor-select"
                    defaultValue=""
                    onChange={(e) => handleSendToVendor(selectedOrderForVendor, e.target.value)}
                    className="admin-filter"
                    style={{ width: "250px" }}
                  >
                    <option value="" disabled>Select Vendor</option>
                    {vendors
                      .filter((v) => v.is_active)
                      .map((v) => (
                        <option key={v.id} value={v.id}>{v.name} ({v.phone})</option>
                      ))}
                  </select>
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => setSelectedOrderForVendor(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <section className="admin-panel">
              <div className="admin-panel-title">
                <div>
                  <h2>All Printing Orders</h2>
                  <p>View order quantity, QR type, customer, and status.</p>
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
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Quantity</th>
                      <th>QR Type</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                          No orders found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id.slice(0, 8).toUpperCase()}</td>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-user-avatar">
                                {(order.user?.username || "US")
                                  .split("_")
                                  .map((word) => word[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <strong>{order.user?.username || "User"}</strong>
                                <span>{order.user?.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>{order.quantity}</td>
                          <td>{order.qr_type} ({order.design_config?.template || "minimal"})</td>
                          <td>
                            <span className={`admin-pill ${getStatusClass(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="admin-row-actions">
                              {/* PENDING → Confirm or Cancel */}
                              {order.status === "PENDING" && (
                                <>
                                  <button className="admin-icon-action"
                                    onClick={() => updateStatus(order.id, "CONFIRMED")}>
                                    Confirm
                                  </button>
                                  <button className="admin-icon-action danger"
                                    onClick={() => updateStatus(order.id, "CANCELLED")}>
                                    Cancel
                                  </button>
                                </>
                              )}

                              {/* CONFIRMED → Assign Vendor + mark Processing */}
                              {order.status === "CONFIRMED" && (
                                <>
                                  <button className="admin-icon-action"
                                    onClick={() => setSelectedOrderForVendor(order.id)}>
                                    Assign Vendor
                                  </button>
                                  <button className="admin-icon-action"
                                    onClick={() => updateStatus(order.id, "PROCESSING")}>
                                    Processing
                                  </button>
                                  <button className="admin-icon-action danger"
                                    onClick={() => updateStatus(order.id, "CANCELLED")}>
                                    Cancel
                                  </button>
                                </>
                              )}

                              {/* PROCESSING → Delivered */}
                              {order.status === "PROCESSING" && (
                                <button className="admin-icon-action"
                                  onClick={() => updateStatus(order.id, "DELIVERED")}>
                                  Mark Delivered
                                </button>
                              )}

                              {/* DELIVERED → Completed */}
                              {order.status === "DELIVERED" && (
                                <button className="admin-icon-action"
                                  onClick={() => updateStatus(order.id, "COMPLETED")}>
                                  Complete
                                </button>
                              )}

                              {["COMPLETED","CANCELLED"].includes(order.status) && (
                                <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>—</span>
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

export default AdminOrders;