import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import ConfirmModal from "../../Component/ConfirmModal";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/Admin/AdminPages.css";
import "../../CSS/Admin/AdminUsers.css";

const AdminUsers = () => {
  const [query, setQuery]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [notice, setNotice]           = useState({ text: "", type: "success" });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // View modal
  const [viewTarget, setViewTarget]   = useState(null);

  // Block/Unblock confirm modal
  const [confirmTarget, setConfirmTarget] = useState(null); // { id, is_active, username }

  // Add User modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser]         = useState({ username: "", email: "", password: "", role: "USER" });
  const [addError, setAddError]       = useState("");
  const [addLoading, setAddLoading]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError("");
        const res    = await fetch(`${API_URL}/admin/users`, { headers: getHeaders() });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to load users");
        setUsers(result.data?.users || result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshTrigger]);

  const filteredUsers = useMemo(() => users.filter((u) => {
    const matchSearch = (u.username || "").toLowerCase().includes(query.toLowerCase())
      || (u.email || "").toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === "all"
      || (statusFilter === "active" ? u.is_active : !u.is_active);
    return matchSearch && matchStatus;
  }), [users, query, statusFilter]);

  // Called after confirm modal
  const handleConfirmToggle = async () => {
    const { id, is_active, username } = confirmTarget;
    setConfirmTarget(null);
    try {
      const res    = await fetch(`${API_URL}/admin/users/${id}/status`, {
        method: "PATCH", headers: getHeaders(),
        body: JSON.stringify({ is_active: !is_active }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update status");
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !is_active } : u));
      setNotice({ text: `${username} has been ${is_active ? "blocked" : "unblocked"}.`, type: "success" });
    } catch (err) {
      setNotice({ text: err.message, type: "error" });
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError("");
    if (!newUser.username || !newUser.email || !newUser.password) {
      setAddError("All fields are required."); return;
    }
    try {
      setAddLoading(true);
      const res    = await fetch(`${API_URL}/admin/users`, {
        method: "POST", headers: getHeaders(),
        body: JSON.stringify(newUser),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create user");
      setShowAddUser(false);
      setNewUser({ username: "", email: "", password: "", role: "USER" });
      setRefreshTrigger(t => t + 1);
      setNotice({ text: `User @${newUser.username} created successfully.`, type: "success" });
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const initials = (username) =>
    (username || "US").split("_").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-page-main">
        <header className="admin-page-header">
          <div>
            <h1>Users Management</h1>
            <p>Manage registered users and their account activity.</p>
          </div>
          <div className="admin-page-header-actions">
            <button type="button" className="admin-btn" onClick={() => setRefreshTrigger(t => t + 1)}>
              Refresh
            </button>
            <button type="button" className="admin-btn primary" onClick={() => setShowAddUser(true)}>
              + Add User
            </button>
          </div>
        </header>

        {notice.text && (
          <div className={`au-notice ${notice.type}`} style={{ marginBottom: 20 }}>
            {notice.text}
            <button onClick={() => setNotice({ text: "", type: "" })}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 16 }}>×</button>
          </div>
        )}
        {error && <div className="au-notice error" style={{ marginBottom: 20 }}>{error}</div>}

        {loading ? (
          <div className="admin-loading"><div className="spinner" /><p>Loading users…</p></div>
        ) : (
          <>
            {/* Stats */}
            <section className="admin-mini-stats">
              <div className="admin-mini-card"><p>Total Users</p><h2>{users.length}</h2><span className="text-blue">Registered</span></div>
              <div className="admin-mini-card"><p>Active Users</p><h2>{users.filter(u => u.is_active).length}</h2><span className="text-green">Currently active</span></div>
              <div className="admin-mini-card"><p>Blocked Users</p><h2>{users.filter(u => !u.is_active).length}</h2><span className="text-red">Restricted</span></div>
              <div className="admin-mini-card"><p>Total Orders</p><h2>{users.reduce((s, u) => s + (u.order_count || 0), 0)}</h2><span className="text-purple">From users</span></div>
            </section>

            {/* Table */}
            <section className="admin-panel">
              <div className="admin-panel-title">
                <div><h2>Registered Users</h2><p>Search, view, block, or unblock user accounts.</p></div>
              </div>

              <div className="admin-toolbar">
                <div className="admin-search-box">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" placeholder="Search by username or email" value={query} onChange={e => setQuery(e.target.value)} />
                </div>
                <select className="admin-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>User</th><th>Email</th><th>Role</th><th>Status</th>
                      <th>Profile</th><th>Orders</th><th>Joined</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="8" style={{ textAlign: "center", padding: "28px", color: "var(--text-tertiary)" }}>No users found.</td></tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-user-avatar">{initials(user.username)}</div>
                              <div className="admin-user-cell-info">
                                <strong>{user.username}</strong>
                                <span>{user.role}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                          <td>
                            <span className={`admin-pill ${user.role === "ADMIN" ? "vendor" : "processing"}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`admin-pill ${user.is_active ? "active" : "blocked"}`}>
                              {user.is_active ? "Active" : "Blocked"}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 60, height: 5, background: "var(--bg-elevated)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ width: `${user.profile_completion || 0}%`, height: "100%", background: "var(--gradient-accent)", borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{user.profile_completion || 0}%</span>
                            </div>
                          </td>
                          <td>{user.order_count || 0}</td>
                          <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="admin-row-actions">
                              <button type="button" className="admin-icon-action"
                                onClick={() => setViewTarget(user)}>View</button>
                              <button type="button"
                                className={`admin-icon-action ${user.is_active ? "danger" : ""}`}
                                onClick={() => setConfirmTarget({ id: user.id, is_active: user.is_active, username: user.username })}>
                                {user.is_active ? "Block" : "Unblock"}
                              </button>
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

      {/* ── View User Modal ── */}
      {viewTarget && (
        <div className="au-modal-overlay" onClick={() => setViewTarget(null)}>
          <div className="au-modal" onClick={e => e.stopPropagation()}>
            <div className="au-modal-header">
              <div className="au-modal-avatar">{initials(viewTarget.username)}</div>
              <div>
                <h2>{viewTarget.username}</h2>
                <p>{viewTarget.email}</p>
              </div>
              <button className="au-modal-close" onClick={() => setViewTarget(null)}>×</button>
            </div>
            <div className="au-modal-body">
              <div className="au-detail-grid">
                <div className="au-detail-item"><span>Role</span><strong>{viewTarget.role}</strong></div>
                <div className="au-detail-item"><span>Status</span>
                  <strong className={viewTarget.is_active ? "text-green" : "text-red"}>
                    {viewTarget.is_active ? "Active" : "Blocked"}
                  </strong>
                </div>
                <div className="au-detail-item"><span>Profile Score</span><strong>{viewTarget.profile_completion || 0}%</strong></div>
                <div className="au-detail-item"><span>Orders</span><strong>{viewTarget.order_count || 0}</strong></div>
                <div className="au-detail-item"><span>Full Name</span><strong>{viewTarget.full_name || "—"}</strong></div>
                <div className="au-detail-item"><span>Job Title</span><strong>{viewTarget.job_title || "—"}</strong></div>
                <div className="au-detail-item au-detail-full"><span>User ID</span>
                  <strong style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 12 }}>{viewTarget.id}</strong>
                </div>
                <div className="au-detail-item"><span>Joined</span>
                  <strong>{new Date(viewTarget.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong>
                </div>
              </div>
            </div>
            <div className="au-modal-footer">
              <button className="admin-btn" onClick={() => setViewTarget(null)}>Close</button>
              <button
                className={`admin-btn ${viewTarget.is_active ? "danger" : "primary"}`}
                onClick={() => { setViewTarget(null); setConfirmTarget({ id: viewTarget.id, is_active: viewTarget.is_active, username: viewTarget.username }); }}>
                {viewTarget.is_active ? "Block User" : "Unblock User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add User Modal ── */}
      {showAddUser && (
        <div className="au-modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="au-modal" onClick={e => e.stopPropagation()}>
            <div className="au-modal-header" style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: 16 }}>
              <div>
                <h2>Add New User</h2>
                <p>Create a new user or admin account</p>
              </div>
              <button className="au-modal-close" onClick={() => setShowAddUser(false)}>×</button>
            </div>
            <form className="au-modal-body" onSubmit={handleAddUser}>
              <div className="admin-form-grid">
                <div className="admin-input-group">
                  <label>Username</label>
                  <input type="text" placeholder="e.g. john_doe" value={newUser.username}
                    onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} required />
                </div>
                <div className="admin-input-group">
                  <label>Email</label>
                  <input type="email" placeholder="user@example.com" value={newUser.email}
                    onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} required />
                </div>
                <div className="admin-input-group">
                  <label>Password</label>
                  <input type="password" placeholder="Min. 6 characters" value={newUser.password}
                    onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} required />
                </div>
                <div className="admin-input-group">
                  <label>Role</label>
                  <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              {addError && <div className="au-notice error" style={{ marginTop: 14 }}>{addError}</div>}
              <div className="au-modal-footer" style={{ marginTop: 24 }}>
                <button type="button" className="admin-btn" onClick={() => setShowAddUser(false)}>Cancel</button>
                <button type="submit" className="admin-btn primary" disabled={addLoading}>
                  {addLoading ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Block / Unblock Confirm ── */}
      <ConfirmModal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmToggle}
        title={confirmTarget?.is_active ? "Block User" : "Unblock User"}
        message={confirmTarget?.is_active
          ? `Block @${confirmTarget?.username}? They won't be able to log in until unblocked.`
          : `Unblock @${confirmTarget?.username}? They will regain full access.`}
        confirmText={confirmTarget?.is_active ? "Block User" : "Unblock User"}
        isDestructive={!!confirmTarget?.is_active}
      />
    </div>
  );
};

export default AdminUsers;
