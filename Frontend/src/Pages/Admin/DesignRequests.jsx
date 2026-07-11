import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/Admin/AdminPages.css";

const AdminDesignRequests = () => {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchDesignRequests = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_URL}/admin/orders`, {
          method: "GET",
          headers: getHeaders(),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to load design requests");
        }

        // Convert printing orders into design requests
        const ordersAsRequests = (result.data || []).map((order) => ({
          id: order.id,
          customer: order.user?.username || order.user?.email || "Unknown",
          style: order.design_config?.template || "Minimal",
          qrType: `${order.qr_type} QR`,
          status: order.status,
          date: new Date(order.created_at).toLocaleDateString(),
          design_config: order.design_config,
        }));

        setRequests(ordersAsRequests);
      } catch (err) {
        console.error("Fetch design requests error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDesignRequests();
  }, [refreshTrigger]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const requestId = request.id || "";
      const customerName = request.customer || "";
      const styleName = request.style || "";

      return (
        requestId.toLowerCase().includes(query.toLowerCase()) ||
        customerName.toLowerCase().includes(query.toLowerCase()) ||
        styleName.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [requests, query]);

  const updateStatus = async (id, backendStatus) => {
    try {
      setNotice("");
      const response = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status: backendStatus }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update status");
      }

      setRequests((prev) =>
        prev.map((request) =>
          request.id === id ? { ...request, status: backendStatus } : request
        )
      );

      setNotice(`Design request #${id.slice(0, 8).toUpperCase()} is now ${backendStatus}.`);
    } catch (err) {
      console.error("Update design status error:", err.message);
      setNotice(err.message);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "pending";
    const lower = status.toLowerCase();
    if (lower === "pending") return "pending";
    if (lower === "confirmed") return "approved";
    if (lower === "completed") return "completed";
    if (lower === "cancelled") return "rejected";
    return "pending";
  };

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-page-main">
        <header className="admin-page-header">
          <div>
            <h1>Design Requests</h1>
            <p>Review custom visiting card design requests from users.</p>
          </div>

          <div className="admin-page-header-actions">
            <button
              type="button"
              className="admin-btn primary"
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
            >
              Refresh
            </button>
          </div>
        </header>

        {error && <div className="admin-form-message error-message">{error}</div>}

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading design requests...</p>
          </div>
        ) : (
          <>
            <section className="admin-mini-stats">
              <div className="admin-mini-card">
                <p>Total Requests</p>
                <h2>{requests.length}</h2>
                <span className="text-blue">Design configurations</span>
              </div>

              <div className="admin-mini-card">
                <p>Pending</p>
                <h2>{requests.filter((r) => r.status === "PENDING").length}</h2>
                <span className="text-orange">Need action</span>
              </div>

              <div className="admin-mini-card">
                <p>Confirmed (Approved)</p>
                <h2>{requests.filter((r) => r.status === "CONFIRMED").length}</h2>
                <span className="text-purple">Ready for print</span>
              </div>

              <div className="admin-mini-card">
                <p>Completed</p>
                <h2>{requests.filter((r) => r.status === "COMPLETED").length}</h2>
                <span className="text-green">Printed</span>
              </div>
            </section>

            <section className="admin-panel">
              <div className="admin-panel-title">
                <div>
                  <h2>Custom Design Requests</h2>
                  <p>Approve, reject, or review card design configurations.</p>
                </div>
              </div>

              <div className="admin-toolbar">
                <div className="admin-search-box">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    placeholder="Search by request ID, customer, or style"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Customer</th>
                      <th>Style</th>
                      <th>QR Type</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                          No design requests found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((request) => (
                        <tr key={request.id}>
                          <td>#{request.id.slice(0, 8).toUpperCase()}</td>
                          <td>{request.customer}</td>
                          <td>{request.style}</td>
                          <td>{request.qrType}</td>
                          <td>
                            <span className={`admin-pill ${getStatusClass(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td>{request.date}</td>
                          <td>
                            <div className="admin-row-actions">
                              <button
                                className="admin-icon-action"
                                onClick={() =>
                                  setNotice(
                                    `Design Configuration — Style: ${request.style} | Font: ${
                                      request.design_config?.font || "Default"
                                    } | Colors: ${request.design_config?.primary_color || "N/A"} & ${
                                      request.design_config?.secondary_color || "N/A"
                                    } | Show Avatar: ${
                                      request.design_config?.show_avatar ? "Yes" : "No"
                                    }`
                                  )
                                }
                              >
                                View Details
                              </button>

                              {request.status === "PENDING" && (
                                <>
                                  <button
                                    className="admin-icon-action"
                                    onClick={() => updateStatus(request.id, "CONFIRMED")}
                                  >
                                    Approve
                                  </button>

                                  <button
                                    className="admin-icon-action danger"
                                    onClick={() => updateStatus(request.id, "CANCELLED")}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {notice && <p className="admin-form-message">{notice}</p>}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDesignRequests;