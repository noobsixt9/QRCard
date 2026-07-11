import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/Admin/AdminPages.css";

const AdminProfiles = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_URL}/admin/users`, {
          method: "GET",
          headers: getHeaders(),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to load profiles");
        }

        // Convert user list with nested profile into profile items
        const userProfiles = (result.data || []).map((user) => ({
          id: user.id,
          owner: user.full_name || user.username,
          username: user.username,
          title: user.job_title || "No Title",
          email: user.email,
          profileUrl: `${window.location.host}/u/${user.username}`,
          status: user.is_active ? "Active" : "Inactive",
          completion: `${user.profile_completion}%`,
          is_active: user.is_active,
        }));

        setProfiles(userProfiles);
      } catch (err) {
        console.error("Fetch profiles error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [refreshTrigger]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const matchesSearch =
        profile.owner.toLowerCase().includes(query.toLowerCase()) ||
        profile.email.toLowerCase().includes(query.toLowerCase()) ||
        profile.title.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && profile.is_active) ||
        (statusFilter === "inactive" && !profile.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [profiles, query, statusFilter]);

  const toggleStatus = async (id, isActive) => {
    try {
      setNotice("");
      const nextActive = !isActive;
      const response = await fetch(`${API_URL}/admin/users/${id}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ is_active: nextActive }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile status");
      }

      setProfiles((prev) =>
        prev.map((profile) =>
          profile.id === id
            ? { ...profile, is_active: nextActive, status: nextActive ? "Active" : "Inactive" }
            : profile
        )
      );

      setNotice(`Profile ${nextActive ? "activated" : "deactivated"} successfully.`);
    } catch (err) {
      console.error("Toggle profile status error:", err.message);
      setNotice(err.message);
    }
  };

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
            <p>Loading digital profiles...</p>
          </div>
        ) : (
          <>
            <section className="admin-mini-stats">
              <div className="admin-mini-card">
                <p>Total Profiles</p>
                <h2>{profiles.length}</h2>
                <span className="text-blue">Created profiles</span>
              </div>

              <div className="admin-mini-card">
                <p>Active Profiles</p>
                <h2>{profiles.filter((p) => p.is_active).length}</h2>
                <span className="text-green">Available online</span>
              </div>

              <div className="admin-mini-card">
                <p>Inactive Profiles</p>
                <h2>{profiles.filter((p) => !p.is_active).length}</h2>
                <span className="text-red">Hidden / Disabled</span>
              </div>

              <div className="admin-mini-card">
                <p>Average Completion</p>
                <h2>
                  {profiles.length > 0
                    ? Math.round(
                        profiles.reduce((sum, p) => sum + parseInt(p.completion), 0) /
                          profiles.length
                      )
                    : 0}
                  %
                </h2>
                <span className="text-purple">Profile completeness</span>
              </div>
            </section>

            <section className="admin-panel">
              <div className="admin-panel-title">
                <div>
                  <h2>Digital Profiles</h2>
                  <p>Check profile status, completion, and details.</p>
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Owner</th>
                      <th>Title</th>
                      <th>Profile URL</th>
                      <th>Completion</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                          No profiles found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map((profile) => (
                        <tr key={profile.id}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-user-avatar">
                                {profile.owner
                                  .split(" ")
                                  .map((word) => word[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <strong>{profile.owner}</strong>
                                <span>{profile.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>{profile.title}</td>
                          <td>
                            <a
                              href={`/u/${profile.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "var(--primary-color)", textDecoration: "underline" }}
                            >
                              {profile.profileUrl}
                            </a>
                          </td>
                          <td>{profile.completion}</td>
                          <td>
                            <span
                              className={`admin-pill ${
                                profile.is_active ? "verified" : "rejected"
                              }`}
                            >
                              {profile.status}
                            </span>
                          </td>
                          <td>
                            <div className="admin-row-actions">
                              <a
                                href={`/u/${profile.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-icon-action"
                                style={{ display: "inline-block", textAlign: "center", lineHeight: "1.8" }}
                              >
                                View
                              </a>

                              <button
                                className={`admin-icon-action ${profile.is_active ? "danger" : ""}`}
                                onClick={() => toggleStatus(profile.id, profile.is_active)}
                              >
                                {profile.is_active ? "Deactivate" : "Activate"}
                              </button>
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

export default AdminProfiles;