import { useEffect, useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/Admin/AdminPages.css";

const AdminSettings = () => {
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState({ text: "", type: "" });

  // Profile fields
  const [profile, setProfile] = useState({
    adminName: "", email: "", phone: "", company: "",
  });

  // Password change
  const [passwords, setPasswords] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  // Preferences
  const [prefs, setPrefs] = useState({
    darkMode:   localStorage.getItem("theme") === "dark",
    isPublic:   true,
  });

  useEffect(() => {
    (async () => {
      try {
        const res    = await fetch(`${API_URL}/profile`, { headers: getHeaders() });
        const result = await res.json();
        if (res.ok) {
          const p = result.data?.profile || result.data || {};
          setProfile({
            adminName: p.full_name    || "",
            email:     p.public_email || "",
            phone:     p.phone        || "",
            company:   p.company      || "",
          });
          setPrefs(prev => ({ ...prev, isPublic: p.is_public !== false }));
        }
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, []);

  // Sync dark mode immediately when toggled
  useEffect(() => {
    const theme = prefs.darkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [prefs.darkMode]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    try {
      const res    = await fetch(`${API_URL}/profile`, {
        method: "PUT", headers: getHeaders(),
        body: JSON.stringify({
          full_name:    profile.adminName.trim(),
          public_email: profile.email.trim(),
          phone:        profile.phone.trim(),
          company:      profile.company.trim(),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save profile");
      setMessage({ text: "Profile saved successfully.", type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    const { currentPassword, newPassword, confirmPassword } = passwords;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ text: "Fill all three password fields.", type: "error" }); return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: "New password must be at least 6 characters.", type: "error" }); return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: "New passwords do not match.", type: "error" }); return;
    }
    try {
      setPwLoading(true);
      const res    = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST", headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to change password");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ text: "Password changed successfully.", type: "success" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setPwLoading(false);
    }
  };

  const togglePublicProfile = async () => {
    const next = !prefs.isPublic;
    setPrefs(p => ({ ...p, isPublic: next }));
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: "PUT", headers: getHeaders(),
        body: JSON.stringify({ is_public: next }),
      });
      if (!res.ok) {
        setPrefs(p => ({ ...p, isPublic: !next }));
        setMessage({ text: "Failed to update profile visibility.", type: "error" });
      } else {
        setMessage({ text: next ? "Admin profile is now public." : "Admin profile is now private.", type: "success" });
      }
    } catch {
      setPrefs(p => ({ ...p, isPublic: !next }));
    }
  };

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-page-main">
        <header className="admin-page-header">
          <div>
            <h1>Admin Settings</h1>
            <p>Manage admin account, password, appearance, and profile preferences.</p>
          </div>
        </header>

        {message.text && (
          <div className={`au-notice ${message.type}`} style={{ marginBottom: 24 }}>
            {message.text}
            <button onClick={() => setMessage({ text: "", type: "" })}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 16 }}>×</button>
          </div>
        )}

        {loading ? (
          <div className="admin-loading"><div className="spinner" /><p>Loading settings…</p></div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

            {/* ── LEFT: Profile + Password ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Profile */}
              <section className="admin-panel">
                <div className="admin-panel-title">
                  <div><h2>Account Profile</h2><p>Update admin name, email, and contact info.</p></div>
                </div>
                <form onSubmit={saveProfile}>
                  <div className="admin-form-grid">
                    <div className="admin-input-group">
                      <label>Admin Name</label>
                      <input type="text" value={profile.adminName}
                        onChange={e => setProfile(p => ({ ...p, adminName: e.target.value }))} required />
                    </div>
                    <div className="admin-input-group">
                      <label>Email Address</label>
                      <input type="email" value={profile.email}
                        onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} required />
                    </div>
                    <div className="admin-input-group">
                      <label>Phone Number</label>
                      <input type="tel" maxLength="15" value={profile.phone}
                        onChange={e => setProfile(p => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))} />
                    </div>
                    <div className="admin-input-group">
                      <label>Company / System Name</label>
                      <input type="text" value={profile.company}
                        onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ marginTop: 22 }}>
                    <button type="submit" className="admin-btn primary">Save Profile</button>
                  </div>
                </form>
              </section>

              {/* Password */}
              <section className="admin-panel">
                <div className="admin-panel-title">
                  <div><h2>Change Password</h2><p>Update your admin account password.</p></div>
                </div>
                <form onSubmit={savePassword}>
                  <div className="admin-form-grid">
                    <div className="admin-input-group">
                      <label>Current Password</label>
                      <input type="password" autoComplete="current-password"
                        placeholder="Enter current password"
                        value={passwords.currentPassword}
                        onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} />
                    </div>
                    <div className="admin-input-group">
                      <label>New Password</label>
                      <input type="password" autoComplete="new-password"
                        placeholder="Min. 6 characters"
                        value={passwords.newPassword}
                        onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />
                    </div>
                    <div className="admin-input-group" style={{ gridColumn: "span 2" }}>
                      <label>Confirm New Password</label>
                      <input type="password" autoComplete="new-password"
                        placeholder="Repeat new password"
                        value={passwords.confirmPassword}
                        onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ marginTop: 22 }}>
                    <button type="submit" className="admin-btn primary" disabled={pwLoading}>
                      {pwLoading ? "Changing…" : "Change Password"}
                    </button>
                  </div>
                </form>
              </section>
            </div>

            {/* ── RIGHT: Appearance + Profile Preferences ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Appearance */}
              <section className="admin-panel">
                <div className="admin-panel-title" style={{ marginBottom: 16 }}>
                  <div><h2>Appearance</h2></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>Dark Mode</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Switch between light and dark theme.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrefs(p => ({ ...p, darkMode: !p.darkMode }))}
                    style={{
                      width: 44, height: 26, border: "none", borderRadius: 999,
                      background: prefs.darkMode ? "var(--gradient-accent)" : "var(--bg-elevated)",
                      border: prefs.darkMode ? "none" : "1.5px solid var(--border-default)",
                      padding: 3, cursor: "pointer", flexShrink: 0,
                      boxShadow: prefs.darkMode ? "var(--shadow-accent)" : "none",
                      transition: "all 0.2s",
                    }}
                    aria-pressed={prefs.darkMode}
                  >
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%", background: "white",
                      display: "block", transition: "transform 0.2s",
                      transform: prefs.darkMode ? "translateX(18px)" : "translateX(0)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }} />
                  </button>
                </div>
              </section>

              {/* Profile Visibility */}
              <section className="admin-panel">
                <div className="admin-panel-title" style={{ marginBottom: 16 }}>
                  <div><h2>Profile Visibility</h2></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>Public Profile</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Allow others to view your admin profile page.</div>
                  </div>
                  <button
                    type="button"
                    onClick={togglePublicProfile}
                    style={{
                      width: 44, height: 26, border: "none", borderRadius: 999,
                      background: prefs.isPublic ? "var(--gradient-accent)" : "var(--bg-elevated)",
                      border: prefs.isPublic ? "none" : "1.5px solid var(--border-default)",
                      padding: 3, cursor: "pointer", flexShrink: 0,
                      boxShadow: prefs.isPublic ? "var(--shadow-accent)" : "none",
                      transition: "all 0.2s",
                    }}
                    aria-pressed={prefs.isPublic}
                  >
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%", background: "white",
                      display: "block", transition: "transform 0.2s",
                      transform: prefs.isPublic ? "translateX(18px)" : "translateX(0)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }} />
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSettings;
