import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import ConfirmModal from "../../Component/ConfirmModal";
import "../../CSS/User/Settings.css";
import { API_URL, getHeaders } from "../../config/api";
import { invalidate, CACHE } from "../../utils/cache";

const Settings = () => {
  const navigate = useNavigate();

  // Read-only identity from localStorage
  const [storedUser, setStoredUser] = useState({ username: "", email: "" });

  // Password change
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    publicProfile: true,
    emailNotifications: true,
    orderUpdates: true,
    defaultQR: "Online",
    darkMode: localStorage.getItem("theme") === "dark",
  });

  const [message, setMessage]       = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading]       = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load user identity + current is_public from the API
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setStoredUser({ username: u.username || "", email: u.email || "" });
      }
    } catch (_) {}

    // Fetch current profile to get is_public value
    (async () => {
      try {
        const res = await fetch(`${API_URL}/profile`, { headers: getHeaders() });
        if (res.ok) {
          const result = await res.json();
          const profile = result.data?.profile || result.data || {};
          setPreferences(p => ({
            ...p,
            publicProfile: profile.is_public !== false, // default true
          }));
        }
      } catch (_) {}
    })();
  }, []);

  // Sync dark-mode preference with DOM
  useEffect(() => {
    const theme = preferences.darkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [preferences.darkMode]);

  const togglePreference = async (key) => {
    const newVal = !preferences[key];
    setPreferences((p) => ({ ...p, [key]: newVal }));

    // Immediately persist publicProfile to the backend
    if (key === "publicProfile") {
      try {
        const res = await fetch(`${API_URL}/profile`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ is_public: newVal }),
        });
        const result = await res.json();
        if (!res.ok) {
          // Roll back on failure
          setPreferences((p) => ({ ...p, [key]: !newVal }));
          setMessage(result.message || "Failed to update profile visibility.");
          setMessageType("error");
          return;
        }
        invalidate(CACHE.PROFILE);
        setMessage(newVal ? "Profile is now public." : "Profile is now private.");
        setMessageType("success");
      } catch {
        setPreferences((p) => ({ ...p, [key]: !newVal }));
        setMessage("Network error — could not update profile visibility.");
        setMessageType("error");
      }
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setMessage("");
    setPasswords((p) => ({ ...p, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setMessage("");

    const { currentPassword, newPassword, confirmPassword } = passwords;
    const anyPasswordField = currentPassword || newPassword || confirmPassword;

    if (anyPasswordField) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setMessage("Please fill all three password fields.");
        setMessageType("error");
        return;
      }
      if (newPassword.length < 6) {
        setMessage("New password must be at least 6 characters.");
        setMessageType("error");
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage("New password and confirm password do not match.");
        setMessageType("error");
        return;
      }

      // Call the backend change-password endpoint
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/auth/change-password`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to change password.");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setMessage("Password changed successfully.");
        setMessageType("success");
      } catch (err) {
        setMessage(err.message);
        setMessageType("error");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Persist is_public to backend
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ is_public: preferences.publicProfile }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save preferences.");
      invalidate(CACHE.PROFILE);
      setMessage("Preferences saved.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/delete-account`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) {
        localStorage.clear();
        navigate("/", { replace: true });
      } else {
        const r = await res.json();
        setMessage(r.message || "Account deletion is not available right now.");
        setMessageType("error");
      }
    } catch {
      setMessage("Account deletion is not available right now.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <Sidebar />

      <main className="settings-main">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account, privacy, QR preferences, notifications, and appearance.</p>
        </div>

        <form className="settings-layout" onSubmit={handleSaveSettings}>
          {/* ── LEFT COLUMN ── */}
          <section className="settings-left">

            {/* Account — read-only */}
            <div className="settings-card">
              <h2>Account</h2>
              <p className="settings-card-subtitle">Your account identity. Contact support to change your email.</p>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label htmlFor="s-username">Username</label>
                  <input
                    id="s-username"
                    type="text"
                    value={storedUser.username}
                    disabled
                    placeholder="—"
                    style={{ cursor: "not-allowed", opacity: 0.6 }}
                  />
                </div>

                <div className="settings-form-group">
                  <label htmlFor="s-email">Email Address</label>
                  <input
                    id="s-email"
                    type="email"
                    value={storedUser.email}
                    disabled
                    placeholder="—"
                    style={{ cursor: "not-allowed", opacity: 0.6 }}
                  />
                </div>
              </div>
            </div>

            {/* Password / Security */}
            <div className="settings-card">
              <h2>Security</h2>
              <p className="settings-card-subtitle">Change your password. Leave blank to keep your current one.</p>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label htmlFor="current-password">Current Password</label>
                  <input
                    id="current-password"
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </div>

                <div className="settings-form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                  />
                </div>

                <div className="settings-form-group full-settings-field">
                  <label htmlFor="confirm-password">Confirm New Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            {/* Save Settings */}
            <div className="settings-save-inline">
              <button type="submit" className="save-settings-btn" disabled={loading}>
                {loading ? "Saving…" : "Save Settings"}
              </button>
              {message && (
                <p className={`settings-message ${messageType === "success" ? "success-message" : "error-message"}`}
                   style={{ margin: 0 }}>
                  {message}
                </p>
              )}
            </div>

            {/* Danger Zone */}
            <div className="settings-card danger-card">
              <h2>Danger Zone</h2>
              <p>Deleting your account permanently removes your profile, QR codes, designs, and orders. This cannot be undone.</p>
              <button
                type="button"
                className="delete-account-btn"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </button>
            </div>
          </section>

          {/* ── RIGHT COLUMN ── */}
          <aside className="settings-right">

            {/* Appearance */}
            <div className="settings-card">
              <h2>Appearance</h2>
              <div className="setting-row">
                <div>
                  <h3>Dark Mode</h3>
                  <p>Switch between light and dark mode.</p>
                </div>
                <button
                  type="button"
                  className={preferences.darkMode ? "settings-toggle active" : "settings-toggle"}
                  onClick={() => togglePreference("darkMode")}
                  aria-label="Toggle dark mode"
                  aria-pressed={preferences.darkMode}
                >
                  <span />
                </button>
              </div>
            </div>

            {/* Profile Preferences */}
            <div className="settings-card">
              <h2>Profile Preferences</h2>

              <div className="setting-row">
                <div>
                  <h3>Public Profile</h3>
                  <p>Allow people to view your profile after scanning QR.</p>
                </div>
                <button
                  type="button"
                  className={preferences.publicProfile ? "settings-toggle active" : "settings-toggle"}
                  onClick={() => togglePreference("publicProfile")}
                  aria-label="Toggle public profile"
                  aria-pressed={preferences.publicProfile}
                >
                  <span />
                </button>
              </div>

              <div className="default-qr-section">
                <label>Default QR Type</label>
                <div className="default-qr-options">
                  {["Online", "vCard"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={preferences.defaultQR === item ? "active" : ""}
                      onClick={() => setPreferences((p) => ({ ...p, defaultQR: item }))}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="settings-card">
              <h2>Notifications</h2>

              <div className="setting-row">
                <div>
                  <h3>Email Notifications</h3>
                  <p>Receive updates and important notices by email.</p>
                </div>
                <button
                  type="button"
                  className={preferences.emailNotifications ? "settings-toggle active" : "settings-toggle"}
                  onClick={() => togglePreference("emailNotifications")}
                  aria-label="Toggle email notifications"
                  aria-pressed={preferences.emailNotifications}
                >
                  <span />
                </button>
              </div>

              <div className="setting-row">
                <div>
                  <h3>Order Updates</h3>
                  <p>Get notified when your printing order status changes.</p>
                </div>
                <button
                  type="button"
                  className={preferences.orderUpdates ? "settings-toggle active" : "settings-toggle"}
                  onClick={() => togglePreference("orderUpdates")}
                  aria-label="Toggle order updates"
                  aria-pressed={preferences.orderUpdates}
                >
                  <span />
                </button>
              </div>
            </div>

            {/* (Save button moved to left column below Security) */}
          </aside>
        </form>
      </main>

      {/* Delete account confirmation modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Account"
        message="This will permanently delete your profile, QR codes, card designs, and all orders. This action cannot be undone."
        confirmText="Delete Account"
        isDestructive={true}
      />
    </div>
  );
};

export default Settings;
