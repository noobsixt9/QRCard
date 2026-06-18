import { useMemo, useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import "../../CSS/Admin/AdminPages.css";

const AdminUsers = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState("");

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Alina Khatun",
      email: "alina@gmail.com",
      role: "User",
      status: "Active",
      profiles: 1,
      orders: 2,
      joined: "17 Jun 2026",
    },
    {
      id: 2,
      name: "Salina Basnet",
      email: "salina@gmail.com",
      role: "User",
      status: "Active",
      profiles: 1,
      orders: 1,
      joined: "15 Jun 2026",
    },
    {
      id: 3,
      name: "Rabim Karki",
      email: "rabim@gmail.com",
      role: "User",
      status: "Blocked",
      profiles: 0,
      orders: 0,
      joined: "10 Jun 2026",
    },
    {
      id: 4,
      name: "Kamal Kunwar",
      email: "kamal@gmail.com",
      role: "User",
      status: "Active",
      profiles: 1,
      orders: 3,
      joined: "08 Jun 2026",
    },
  ]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        user.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [users, query, statusFilter]);

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Blocked" : "Active",
            }
          : user
      )
    );

    setNotice("User status updated successfully.");
  };

  const viewUser = (user) => {
    setNotice(`Viewing ${user.name}'s account summary.`);
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
              onClick={() => setNotice("Add user will connect with backend later.")}
            >
              Add User
            </button>
          </div>
        </header>

        <section className="admin-mini-stats">
          <div className="admin-mini-card">
            <p>Total Users</p>
            <h2>{users.length}</h2>
            <span className="text-blue">Registered users</span>
          </div>

          <div className="admin-mini-card">
            <p>Active Users</p>
            <h2>{users.filter((u) => u.status === "Active").length}</h2>
            <span className="text-green">Currently active</span>
          </div>

          <div className="admin-mini-card">
            <p>Blocked Users</p>
            <h2>{users.filter((u) => u.status === "Blocked").length}</h2>
            <span className="text-red">Restricted accounts</span>
          </div>

          <div className="admin-mini-card">
            <p>Total Orders</p>
            <h2>{users.reduce((sum, user) => sum + user.orders, 0)}</h2>
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
                placeholder="Search by name or email"
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
                  <th>Profiles</th>
                  <th>Orders</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">
                          {user.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <strong>{user.name}</strong>
                          <span>{user.role}</span>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span
                        className={`admin-pill ${
                          user.status === "Active" ? "active" : "blocked"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>{user.profiles}</td>
                    <td>{user.orders}</td>
                    <td>{user.joined}</td>
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
                            user.status === "Active" ? "danger" : ""
                          }`}
                          onClick={() => toggleStatus(user.id)}
                        >
                          {user.status === "Active" ? "Block" : "Unblock"}
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

export default AdminUsers;