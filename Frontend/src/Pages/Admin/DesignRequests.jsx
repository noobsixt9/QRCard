import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/Admin/AdminPages.css";
import "../../CSS/Admin/AdminUsers.css";

const SWATCHES = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#0f172a"];

const AdminDesignRequests = () => {
  const [query, setQuery]             = useState("");
  const [notice, setNotice]           = useState("");
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [viewTarget, setViewTarget]   = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError("");
        const res    = await fetch(`${API_URL}/admin/orders`, { headers: getHeaders() });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to load design requests");

        const mapped = (result.data || []).map((order) => ({
          id:            order.id,
          customer:      order.user?.username || order.user?.email || "Unknown",
          email:         order.user?.email || "",
          style:         order.design_config?.template || "Minimal",
          layout:        order.design_config?.layout || "standard",
          qrType:        order.qr_type,
          cardQrType:    order.design_config?.card_qr_type || order.qr_type,
          themeColor:    order.design_config?.theme_color || "#6366f1",
          fontStyle:     order.design_config?.font_style || "modern",
          cornerStyle:   order.design_config?.corner_style || "rounded",
          showLogo:      order.design_config?.show_logo !== false,
          quantity:      order.quantity,
          notes:         order.notes || "",
          status:        order.status,
          date:          new Date(order.created_at).toLocaleDateString(),
          design_config: order.design_config,
        }));

        setRequests(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshTrigger]);

  const filteredRequests = useMemo(() =>
    requests.filter((r) =>
      r.id.toLowerCase().includes(query.toLowerCase()) ||
      r.customer.toLowerCase().includes(query.toLowerCase()) ||
      r.style.toLowerCase().includes(query.toLowerCase())
    ), [requests, query]);

  const updateStatus = async (id, backendStatus) => {
    try {
      setNotice("");
      const res    = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: "PATCH", headers: getHeaders(),
        body: JSON.stringify({ status: backendStatus }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update status");
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: backendStatus } : r));
      if (viewTarget?.id === id) setViewTarget(v => ({ ...v, status: backendStatus }));
      setNotice(`Request #${id.slice(0, 8).toUpperCase()} updated to ${backendStatus}.`);
    } catch (err) {
      setNotice(err.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":    return "pending";
      case "CONFIRMED":  return "approved";
      case "PROCESSING": return "processing";
      case "DELIVERED":  return "processing";
      case "COMPLETED":  return "completed";
      case "CANCELLED":  return "rejected";
      default:           return "pending";
    }
  };

  const getStatusLabel = (s) => {
    if (s === "CONFIRMED") return "Approved";
    if (s === "CANCELLED") return "Rejected";
    return s ? s.charAt(0) + s.slice(1).toLowerCase() : "—";
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
            <button type="button" className="admin-btn primary" onClick={() => setRefreshTrigger(t => t + 1)}>
              Refresh
            </button>
          </div>
        </header>

        {error  && <div className="au-notice error"   style={{ marginBottom: 20 }}>{error}</div>}
        {notice && <div className="au-notice success" style={{ marginBottom: 20 }}>{notice}</div>}

        {loading ? (
          <div className="admin-loading"><div className="spinner" /><p>Loading design requests…</p></div>
        ) : (
          <>
            <section className="admin-mini-stats">
              <div className="admin-mini-card"><p>Total Requests</p><h2>{requests.length}</h2><span className="text-blue">Design configurations</span></div>
              <div className="admin-mini-card"><p>Pending</p><h2>{requests.filter(r => r.status === "PENDING").length}</h2><span className="text-orange">Need action</span></div>
              <div className="admin-mini-card"><p>Approved</p><h2>{requests.filter(r => r.status === "CONFIRMED").length}</h2><span className="text-purple">Ready for print</span></div>
              <div className="admin-mini-card"><p>Completed</p><h2>{requests.filter(r => r.status === "COMPLETED").length}</h2><span className="text-green">Printed</span></div>
            </section>

            <section className="admin-panel">
              <div className="admin-panel-title">
                <div><h2>Custom Design Requests</h2><p>View design config, approve or reject card requests.</p></div>
              </div>

              <div className="admin-toolbar">
                <div className="admin-search-box">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" placeholder="Search by ID, customer, or style" value={query} onChange={e => setQuery(e.target.value)} />
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Request ID</th><th>Customer</th><th>Style</th><th>QR Type</th>
                      <th>Quantity</th><th>Status</th><th>Date</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr><td colSpan="8" style={{ textAlign: "center", padding: "28px", color: "var(--text-tertiary)" }}>No design requests found.</td></tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req.id}>
                          <td style={{ fontFamily: "'Space Grotesk', monospace", fontWeight: 700 }}>#{req.id.slice(0, 8).toUpperCase()}</td>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-user-avatar">{req.customer.slice(0, 2).toUpperCase()}</div>
                              <div className="admin-user-cell-info">
                                <strong>{req.customer}</strong>
                                <span>{req.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>{req.style}</td>
                          <td>{req.cardQrType}</td>
                          <td>{req.quantity}</td>
                          <td><span className={`admin-pill ${getStatusClass(req.status)}`}>{getStatusLabel(req.status)}</span></td>
                          <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{req.date}</td>
                          <td>
                            <div className="admin-row-actions">
                              <button className="admin-icon-action" onClick={() => setViewTarget(req)}>
                                View
                              </button>
                              {req.status === "PENDING" && (
                                <>
                                  <button className="admin-icon-action" onClick={() => updateStatus(req.id, "CONFIRMED")}>Approve</button>
                                  <button className="admin-icon-action danger" onClick={() => updateStatus(req.id, "CANCELLED")}>Reject</button>
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
            </section>
          </>
        )}
      </main>

      {/* ── Design Request Detail Modal ── */}
      {viewTarget && (
        <div className="au-modal-overlay" onClick={() => setViewTarget(null)}>
          <div className="au-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="au-modal-header">
              <div className="au-modal-avatar" style={{ borderRadius: "var(--r-md)", background: viewTarget.themeColor }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="20" height="20">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <div>
                <h2>Design Request #{viewTarget.id.slice(0, 8).toUpperCase()}</h2>
                <p>by @{viewTarget.customer} · {viewTarget.date}</p>
              </div>
              <button className="au-modal-close" onClick={() => setViewTarget(null)}>×</button>
            </div>

            <div className="au-modal-body" style={{ paddingTop: 16 }}>
              {/* Card mini-preview */}
              <div style={{
                background: "#fff", borderRadius: 10, height: 80,
                display: "flex", alignItems: "center", padding: "0 16px",
                border: `3px solid ${viewTarget.themeColor}`,
                marginBottom: 18, position: "relative", overflow: "hidden",
              }}>
                <div style={{ width: 4, position: "absolute", left: 0, top: 0, bottom: 0, background: viewTarget.themeColor }} />
                <div style={{ paddingLeft: 12, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{viewTarget.customer}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{viewTarget.style} · {viewTarget.layout} · {viewTarget.fontStyle}</div>
                </div>
                <div style={{
                  width: 52, height: 52, border: `1.5px solid ${viewTarget.themeColor}40`,
                  borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,8px)", gap: 2 }}>
                    {[1,1,1, 1,0,1, 1,1,1].map((v,i) => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: 1, background: v ? viewTarget.themeColor : "transparent" }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="au-detail-grid">
                <div className="au-detail-item"><span>Template</span><strong>{viewTarget.style}</strong></div>
                <div className="au-detail-item"><span>Layout</span><strong style={{ textTransform: "capitalize" }}>{viewTarget.layout}</strong></div>
                <div className="au-detail-item"><span>QR Type</span><strong>{viewTarget.cardQrType}</strong></div>
                <div className="au-detail-item"><span>Quantity</span><strong>{viewTarget.quantity} cards</strong></div>
                <div className="au-detail-item"><span>Font Style</span><strong style={{ textTransform: "capitalize" }}>{viewTarget.fontStyle}</strong></div>
                <div className="au-detail-item"><span>Card Corners</span><strong style={{ textTransform: "capitalize" }}>{viewTarget.cornerStyle}</strong></div>
                <div className="au-detail-item"><span>Show Logo</span><strong>{viewTarget.showLogo ? "Yes" : "No"}</strong></div>
                <div className="au-detail-item">
                  <span>Accent Color</span>
                  <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", background: viewTarget.themeColor, display: "inline-block", border: "1px solid var(--border-default)" }} />
                    {viewTarget.themeColor}
                  </strong>
                </div>
                <div className="au-detail-item"><span>Status</span>
                  <strong className={viewTarget.status === "COMPLETED" ? "text-green" : viewTarget.status === "CANCELLED" ? "text-red" : "text-purple"}>
                    {getStatusLabel(viewTarget.status)}
                  </strong>
                </div>
                <div className="au-detail-item au-detail-full"><span>Notes</span><strong>{viewTarget.notes || "—"}</strong></div>
              </div>
            </div>

            <div className="au-modal-footer">
              <button className="admin-btn" onClick={() => setViewTarget(null)}>Close</button>
              {viewTarget.status === "PENDING" && (
                <>
                  <button className="admin-btn danger" onClick={() => updateStatus(viewTarget.id, "CANCELLED")}>Reject</button>
                  <button className="admin-btn primary" onClick={() => updateStatus(viewTarget.id, "CONFIRMED")}>Approve</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDesignRequests;
