import { useMemo, useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import "../../CSS/Admin/AdminPages.css";

const AdminDesignRequests = () => {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  const [requests, setRequests] = useState([
    {
      id: "DSN-001",
      customer: "Alina Khatun",
      style: "Minimal",
      qrType: "Online QR",
      status: "Pending",
      date: "17 Jun 2026",
    },
    {
      id: "DSN-002",
      customer: "Salina Basnet",
      style: "Creative",
      qrType: "vCard QR",
      status: "Review",
      date: "16 Jun 2026",
    },
    {
      id: "DSN-003",
      customer: "Rabim Karki",
      style: "Professional",
      qrType: "Online + vCard",
      status: "Approved",
      date: "15 Jun 2026",
    },
  ]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      return (
        request.id.toLowerCase().includes(query.toLowerCase()) ||
        request.customer.toLowerCase().includes(query.toLowerCase()) ||
        request.style.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [requests, query]);

  const updateStatus = (id, status) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );

    setNotice(`${id} marked as ${status}.`);
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
              onClick={() => setNotice("New requests refreshed.")}
            >
              Refresh
            </button>
          </div>
        </header>

        <section className="admin-mini-stats">
          <div className="admin-mini-card">
            <p>Total Requests</p>
            <h2>{requests.length}</h2>
            <span className="text-blue">Design requests</span>
          </div>

          <div className="admin-mini-card">
            <p>Pending</p>
            <h2>{requests.filter((r) => r.status === "Pending").length}</h2>
            <span className="text-orange">Need action</span>
          </div>

          <div className="admin-mini-card">
            <p>In Review</p>
            <h2>{requests.filter((r) => r.status === "Review").length}</h2>
            <span className="text-purple">Being checked</span>
          </div>

          <div className="admin-mini-card">
            <p>Approved</p>
            <h2>{requests.filter((r) => r.status === "Approved").length}</h2>
            <span className="text-green">Ready for order</span>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-title">
            <div>
              <h2>Custom Design Requests</h2>
              <p>Approve, reject, or review card design requests.</p>
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
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>#{request.id}</td>
                    <td>{request.customer}</td>
                    <td>{request.style}</td>
                    <td>{request.qrType}</td>
                    <td>
                      <span className={`admin-pill ${request.status.toLowerCase()}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>{request.date}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="admin-icon-action"
                          onClick={() => updateStatus(request.id, "Review")}
                        >
                          Review
                        </button>

                        <button
                          className="admin-icon-action"
                          onClick={() => updateStatus(request.id, "Approved")}
                        >
                          Approve
                        </button>

                        <button
                          className="admin-icon-action danger"
                          onClick={() => updateStatus(request.id, "Rejected")}
                        >
                          Reject
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

export default AdminDesignRequests;