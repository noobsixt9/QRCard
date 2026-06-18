import { useMemo, useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import "../../CSS/Admin/AdminPages.css";

const AdminProfiles = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState("");

  const profiles = [
    {
      id: 1,
      owner: "Alina Khatun",
      title: "Backend Developer",
      email: "alina@gmail.com",
      profileUrl: "qrcard.com/alina",
      status: "Verified",
      completion: "90%",
      qrType: "Online + vCard",
    },
    {
      id: 2,
      owner: "Salina Basnet",
      title: "Graphic Designer",
      email: "salina@gmail.com",
      profileUrl: "qrcard.com/salina",
      status: "Pending",
      completion: "70%",
      qrType: "Online",
    },
    {
      id: 3,
      owner: "Rabim Karki",
      title: "Marketing Officer",
      email: "rabim@gmail.com",
      profileUrl: "qrcard.com/rabim",
      status: "Verified",
      completion: "85%",
      qrType: "vCard",
    },
    {
      id: 4,
      owner: "Kamal Kunwar",
      title: "Business Owner",
      email: "kamal@gmail.com",
      profileUrl: "qrcard.com/kamal",
      status: "Rejected",
      completion: "45%",
      qrType: "Online",
    },
  ];

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const matchesSearch =
        profile.owner.toLowerCase().includes(query.toLowerCase()) ||
        profile.email.toLowerCase().includes(query.toLowerCase()) ||
        profile.title.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        profile.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [query, statusFilter]);

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-page-main">
        <header className="admin-page-header">
          <div>
            <h1>Profiles Management</h1>
            <p>Review and manage digital profiles created by users.</p>
          </div>

          <div className="admin-page-header-actions">
            <button
              type="button"
              className="admin-btn primary"
              onClick={() => setNotice("Profile review list refreshed.")}
            >
              Refresh
            </button>
          </div>
        </header>

        <section className="admin-mini-stats">
          <div className="admin-mini-card">
            <p>Total Profiles</p>
            <h2>{profiles.length}</h2>
            <span className="text-blue">Created profiles</span>
          </div>

          <div className="admin-mini-card">
            <p>Verified</p>
            <h2>{profiles.filter((p) => p.status === "Verified").length}</h2>
            <span className="text-green">Approved profiles</span>
          </div>

          <div className="admin-mini-card">
            <p>Pending</p>
            <h2>{profiles.filter((p) => p.status === "Pending").length}</h2>
            <span className="text-orange">Need review</span>
          </div>

          <div className="admin-mini-card">
            <p>Rejected</p>
            <h2>{profiles.filter((p) => p.status === "Rejected").length}</h2>
            <span className="text-red">Needs correction</span>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-title">
            <div>
              <h2>Digital Profiles</h2>
              <p>Check profile status, completion, and QR type.</p>
            </div>
          </div>

          <div className="admin-toolbar">
            <div className="admin-search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search profile by owner, email, or title"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <select
              className="admin-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Title</th>
                  <th>Profile URL</th>
                  <th>QR Type</th>
                  <th>Completion</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {profile.owner
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <strong>{profile.owner}</strong>
                          <span>{profile.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{profile.title}</td>
                    <td>{profile.profileUrl}</td>
                    <td>{profile.qrType}</td>
                    <td>{profile.completion}</td>
                    <td>
                      <span
                        className={`admin-pill ${profile.status.toLowerCase()}`}
                      >
                        {profile.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="admin-icon-action"
                          onClick={() =>
                            setNotice(`Preview opened for ${profile.owner}.`)
                          }
                        >
                          View
                        </button>

                        <button
                          className="admin-icon-action"
                          onClick={() =>
                            setNotice(`${profile.owner}'s profile approved.`)
                          }
                        >
                          Approve
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

export default AdminProfiles;