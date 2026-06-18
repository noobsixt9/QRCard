import { useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import "../../CSS/Admin/AdminPages.css";

const AdminSettings = () => {
  const [notice, setNotice] = useState("");
  const [settings, setSettings] = useState({
    adminName: "Admin",
    email: "admin@qrcard.com",
    phone: "9800000000",
    company: "QR Card",
    orderEmail: true,
    profileReview: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setNotice("");
  };

  const saveSettings = (e) => {
    e.preventDefault();

    if (!settings.adminName.trim() || !settings.email.trim()) {
      setNotice("Admin name and email are required.");
      return;
    }

    setNotice("Settings saved successfully.");
  };

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-page-main">
        <header className="admin-page-header">
          <div>
            <h1>Admin Settings</h1>
            <p>Manage admin account, notifications, and system preferences.</p>
          </div>
        </header>

        <section className="admin-panel">
          <div className="admin-panel-title">
            <div>
              <h2>Account Settings</h2>
              <p>Update basic admin information.</p>
            </div>
          </div>

          <form onSubmit={saveSettings}>
            <div className="admin-form-grid">
              <div className="admin-input-group">
                <label>Admin Name</label>
                <input
                  type="text"
                  name="adminName"
                  value={settings.adminName}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  maxLength="15"
                />
              </div>

              <div className="admin-input-group">
                <label>Company / System Name</label>
                <input
                  type="text"
                  name="company"
                  value={settings.company}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ marginTop: "26px" }}>
              <button type="submit" className="admin-btn primary">
                Save Settings
              </button>
            </div>

            {notice && <p className="admin-form-message">{notice}</p>}
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-title">
            <div>
              <h2>Notification Preferences</h2>
              <p>Choose what admin should be notified about.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <label className="admin-btn">
              <input
                type="checkbox"
                name="orderEmail"
                checked={settings.orderEmail}
                onChange={handleChange}
                style={{ marginRight: "10px" }}
              />
              Notify me for new printing orders
            </label>

            <label className="admin-btn">
              <input
                type="checkbox"
                name="profileReview"
                checked={settings.profileReview}
                onChange={handleChange}
                style={{ marginRight: "10px" }}
              />
              Notify me for profile review requests
            </label>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminSettings;