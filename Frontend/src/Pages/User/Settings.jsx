import { useState } from "react";
import Sidebar from "../../Component/User/Sidebar";
import "../../CSS/User/Settings.css";

const Settings = () => {
  const [accountData, setAccountData] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    publicProfile: true,
    emailNotifications: true,
    orderUpdates: true,
    defaultQR: "Online",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const isAccountValid =
    accountData.fullName.trim() && accountData.email.trim();

  const handleAccountChange = (e) => {
    const { name, value } = e.target;

    if (name === "fullName") {
      const lettersOnly = value.replace(/[^a-zA-Z\s.'-]/g, "");
      setAccountData({ ...accountData, fullName: lettersOnly });
      return;
    }

    setAccountData({
      ...accountData,
      [name]: value,
    });
  };

  const togglePreference = (key) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();

    if (!isAccountValid) {
      setMessage("Please add your full name and email address.");
      setMessageType("error");
      return;
    }

    const passwordFieldsUsed =
      accountData.currentPassword ||
      accountData.newPassword ||
      accountData.confirmPassword;

    if (passwordFieldsUsed) {
      if (
        !accountData.currentPassword ||
        !accountData.newPassword ||
        !accountData.confirmPassword
      ) {
        setMessage("Please fill all password fields.");
        setMessageType("error");
        return;
      }

      if (accountData.newPassword.length < 6) {
        setMessage("New password must be at least 6 characters.");
        setMessageType("error");
        return;
      }

      if (accountData.newPassword !== accountData.confirmPassword) {
        setMessage("New password and confirm password do not match.");
        setMessageType("error");
        return;
      }
    }

    setMessage("Settings saved successfully.");
    setMessageType("success");

    console.log({
      accountData,
      preferences,
    });
  };

  const handleDeleteAccount = () => {
    setMessage("Delete account feature can be connected with backend later.");
    setMessageType("error");
  };

  return (
    <div className="settings-page">
      <Sidebar />

      <main className="settings-main">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account, privacy, QR preferences, and notifications.</p>
        </div>

        <form className="settings-layout" onSubmit={handleSaveSettings}>
          <section className="settings-left">
            <div className="settings-card">
              <h2>Account Settings</h2>
              <p className="settings-card-subtitle">
                Update your basic account information.
              </p>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={accountData.fullName}
                    onChange={handleAccountChange}
                    placeholder="Alina Khatun"
                  />
                </div>

                <div className="settings-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={accountData.email}
                    onChange={handleAccountChange}
                    placeholder="alina@gmail.com"
                  />
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h2>Security</h2>
              <p className="settings-card-subtitle">
                Change your password to keep your account secure.
              </p>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={accountData.currentPassword}
                    onChange={handleAccountChange}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="settings-form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={accountData.newPassword}
                    onChange={handleAccountChange}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="settings-form-group full-settings-field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={accountData.confirmPassword}
                    onChange={handleAccountChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div className="settings-card danger-card">
              <h2>Danger Zone</h2>
              <p>
                Delete account option should be used carefully. This action can
                be connected with backend confirmation later.
              </p>

              <button
                type="button"
                className="delete-account-btn"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </section>

          <aside className="settings-right">
            <div className="settings-card">
              <h2>Profile Preferences</h2>

              <div className="setting-row">
                <div>
                  <h3>Public Profile</h3>
                  <p>Allow people to view your profile after scanning QR.</p>
                </div>

                <button
                  type="button"
                  className={
                    preferences.publicProfile
                      ? "settings-toggle active"
                      : "settings-toggle"
                  }
                  onClick={() => togglePreference("publicProfile")}
                >
                  <span></span>
                </button>
              </div>

              <div className="default-qr-section">
                <label>Default QR Type</label>

                <div className="default-qr-options">
                  {["Online", "vCard"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={
                        preferences.defaultQR === item ? "active" : ""
                      }
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          defaultQR: item,
                        })
                      }
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h2>Notifications</h2>

              <div className="setting-row">
                <div>
                  <h3>Email Notifications</h3>
                  <p>Receive updates and important notices by email.</p>
                </div>

                <button
                  type="button"
                  className={
                    preferences.emailNotifications
                      ? "settings-toggle active"
                      : "settings-toggle"
                  }
                  onClick={() => togglePreference("emailNotifications")}
                >
                  <span></span>
                </button>
              </div>

              <div className="setting-row">
                <div>
                  <h3>Order Updates</h3>
                  <p>Get notified when your printing order status changes.</p>
                </div>

                <button
                  type="button"
                  className={
                    preferences.orderUpdates
                      ? "settings-toggle active"
                      : "settings-toggle"
                  }
                  onClick={() => togglePreference("orderUpdates")}
                >
                  <span></span>
                </button>
              </div>
            </div>

            <div className="settings-save-card">
              <button
                type="submit"
                className="save-settings-btn"
                disabled={!isAccountValid}
              >
                Save Settings
              </button>

              {message && (
                <p
                  className={
                    messageType === "success"
                      ? "settings-message success-message"
                      : "settings-message error-message"
                  }
                >
                  {message}
                </p>
              )}
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
};

export default Settings;
