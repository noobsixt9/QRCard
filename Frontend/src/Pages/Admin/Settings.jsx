import { useEffect, useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/Admin/AdminPages.css";

const AdminSettings = () => {
  const [notice, setNotice] = useState("");
  const [settings, setSettings] = useState({
    adminName: "",
    email: "",
    phone: "",
    company: "",
    orderEmail: true,
    profileReview: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/profile`, {
          method: "GET",
          headers: getHeaders(),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to load admin profile");
        }

        const profile = result.data?.profile || result.data || {};
        setSettings((prev) => ({
          ...prev,
          adminName: profile.full_name || "Admin",
          email: profile.public_email || "",
          phone: profile.phone || "",
          company: profile.company || "QR Card",
        }));
      } catch (err) {
        console.error("Fetch admin profile error:", err.message);
        setNotice(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setNotice("");
  };

  const saveSettings = async (e) => {
    e.preventDefault();

    if (!settings.adminName.trim() || !settings.email.trim()) {
      setNotice("Admin name and email are required.");
      return;
    }

    try {
      setNotice("Saving settings...");
      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          full_name: settings.adminName.trim(),
          phone: settings.phone.trim(),
          company: settings.company.trim(),
          public_email: settings.email.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to save settings");
      }

      setNotice("Settings saved successfully.");
    } catch (err) {
      console.error("Save settings error:", err.message);
      setNotice(err.message);
    }
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

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading settings...</p>
          </div>
        ) : (
          <>
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
                      required
                    />
                  </div>

                  <div className="admin-input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={settings.email}
                      onChange={handleChange}
                      required
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
          </>
        )}
      </main>
    </div>
  );
};

export default AdminSettings;