import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/Admin/AdminPages.css";

const AdminUsers = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_URL}/admin/users`, {
          method: "GET",
          headers: getHeaders(),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to load users");
        }

        setUsers(result.data || []);
      } catch (err) {
        console.error("Fetch users error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [refreshTrigger]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const usernameStr = user.username || "";
      const emailStr = user.email || "";

      const matchesSearch =
        usernameStr.toLowerCase().includes(query.toLowerCase()) ||
        emailStr.toLowerCase().includes(query.toLowerCase());

      const userStatus = user.is_active ? "active" : "blocked";
      const matchesStatus =
        statusFilter === "all" ||
        userStatus === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [users, query, statusFilter]);

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
        throw new Error(result.message || "Failed to update user status");
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, is_active: nextActive } : user
        )
      );

      setNotice(`User ${nextActive ? "unblocked" : "blocked"} successfully.`);
    } catch (err) {
      console.error("Toggle status error:", err.message);
      setNotice(err.message);
    }
  };

  const viewUser = (user) => {
    setNotice(`User ID: ${user.id} | Joined: ${new Date(user.created_at).toLocaleDateString()}`);
  };

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
            <button
              type="button"
              className="admin-btn primary"
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
            >
              Refresh List
            </button>
          </div>
        </header>

        {error && <div className="admin-form-message error-message">{error}</div>}

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading users list...</p>
          </div>
        ) : (
          <>
            <section className="admin-mini-stats">
              <div className="admin-mini-card">
                <p>Total Users</p>
                <h2>{users.length}</h2>
                <span className="text-blue">Registered users</span>
              </div>

              <div className="admin-mini-card">
                <p>Active Users</p>
                <h2>{users.filter((u) => u.is_active).length}</h2>
                <span className="text-green">Currently active</span>
              </div>

              <div className="admin-mini-card">
                <p>Blocked Users</p>
                <h2>{users.filter((u) => !u.is_active).length}</h2>
                <span className="text-red">Restricted accounts</span>
              </div>

              <div className="admin-mini-card">
                <p>Total Orders</p>
                <h2>{users.reduce((sum, user) => sum + (user.order_count || 0), 0)}</h2>
                <span className="text-purple">From users</span>
              </div>
            </section>

            <section className="admin-panel">
              <div className="admin-panel-title">
                <div>
                  <h2>Registered Users</h2>
                  <p>Search, view, block, or unblock user accounts.</p>
                </div>
              </div>

              <div className="admin-toolbar">
                <div className="admin-search-box">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    placeholder="Search by username or email"
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
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Profile Completion</th>
                      <th>Orders</th>
                      <th>Joined</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                          No users found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-user-avatar">
                                {(user.username || "US")
                                  .split("_")
                                  .map((word) => word[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <strong>{user.username}</strong>
                                <span>{user.role}</span>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>
                            <span
                              className={`admin-pill ${
                                user.is_active ? "active" : "blocked"
                              }`}
                            >
                              {user.is_active ? "Active" : "Blocked"}
                            </span>
                          </td>
                          <td>{user.profile_completion}%</td>
                          <td>{user.order_count || 0}</td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="admin-row-actions">
                              <button
                                type="button"
                                className="admin-icon-action"
                                onClick={() => viewUser(user)}
                              >
                                View
                              </button>

                              <button
                                type="button"
                                className={`admin-icon-action ${
                                  user.is_active ? "danger" : ""
                                }`}
                                onClick={() => toggleStatus(user.id, user.is_active)}
                              >
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

              {notice && <p className="admin-form-message">{notice}</p>}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;