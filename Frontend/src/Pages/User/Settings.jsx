// import { useState } from "react";
// import Sidebar from "../../Component/User/Sidebar";
// import "../../CSS/User/Settings.css";

// const Settings = () => {
//   const [accountData, setAccountData] = useState({
//     fullName: "",
//     email: "",
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [preferences, setPreferences] = useState({
//     publicProfile: true,
//     emailNotifications: true,
//     orderUpdates: true,
//     defaultQR: "Online",
//   });

//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("");

//   const isAccountValid =
//     accountData.fullName.trim() && accountData.email.trim();

//   const handleAccountChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "fullName") {
//       const lettersOnly = value.replace(/[^a-zA-Z\s.'-]/g, "");
//       setAccountData({ ...accountData, fullName: lettersOnly });
//       return;
//     }

//     setAccountData({
//       ...accountData,
//       [name]: value,
//     });
//   };

//   const togglePreference = (key) => {
//     setPreferences({
//       ...preferences,
//       [key]: !preferences[key],
//     });
//   };

//   const handleSaveSettings = (e) => {
//     e.preventDefault();

//     if (!isAccountValid) {
//       setMessage("Please add your full name and email address.");
//       setMessageType("error");
//       return;
//     }

//     const passwordFieldsUsed =
//       accountData.currentPassword ||
//       accountData.newPassword ||
//       accountData.confirmPassword;

//     if (passwordFieldsUsed) {
//       if (
//         !accountData.currentPassword ||
//         !accountData.newPassword ||
//         !accountData.confirmPassword
//       ) {
//         setMessage("Please fill all password fields.");
//         setMessageType("error");
//         return;
//       }

//       if (accountData.newPassword.length < 6) {
//         setMessage("New password must be at least 6 characters.");
//         setMessageType("error");
//         return;
//       }

//       if (accountData.newPassword !== accountData.confirmPassword) {
//         setMessage("New password and confirm password do not match.");
//         setMessageType("error");
//         return;
//       }
//     }

//     setMessage("Settings saved successfully.");
//     setMessageType("success");

//     console.log({
//       accountData,
//       preferences,
//     });
//   };

//   const handleDeleteAccount = () => {
//     setMessage("Delete account feature can be connected with backend later.");
//     setMessageType("error");
//   };

//   return (
//     <div className="settings-page">
//       <Sidebar />

//       <main className="settings-main">
//         <div className="settings-header">
//           <h1>Settings</h1>
//           <p>Manage your account, privacy, QR preferences, and notifications.</p>
//         </div>

//         <form className="settings-layout" onSubmit={handleSaveSettings}>
//           <section className="settings-left">
//             <div className="settings-card">
//               <h2>Account Settings</h2>
//               <p className="settings-card-subtitle">
//                 Update your basic account information.
//               </p>

//               <div className="settings-form-grid">
//                 <div className="settings-form-group">
//                   <label>Full Name</label>
//                   <input
//                     type="text"
//                     name="fullName"
//                     value={accountData.fullName}
//                     onChange={handleAccountChange}
//                     placeholder="Alina Khatun"
//                   />
//                 </div>

//                 <div className="settings-form-group">
//                   <label>Email Address</label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={accountData.email}
//                     onChange={handleAccountChange}
//                     placeholder="alina@gmail.com"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="settings-card">
//               <h2>Security</h2>
//               <p className="settings-card-subtitle">
//                 Change your password to keep your account secure.
//               </p>

//               <div className="settings-form-grid">
//                 <div className="settings-form-group">
//                   <label>Current Password</label>
//                   <input
//                     type="password"
//                     name="currentPassword"
//                     value={accountData.currentPassword}
//                     onChange={handleAccountChange}
//                     placeholder="Enter current password"
//                   />
//                 </div>

//                 <div className="settings-form-group">
//                   <label>New Password</label>
//                   <input
//                     type="password"
//                     name="newPassword"
//                     value={accountData.newPassword}
//                     onChange={handleAccountChange}
//                     placeholder="Enter new password"
//                   />
//                 </div>

//                 <div className="settings-form-group full-settings-field">
//                   <label>Confirm Password</label>
//                   <input
//                     type="password"
//                     name="confirmPassword"
//                     value={accountData.confirmPassword}
//                     onChange={handleAccountChange}
//                     placeholder="Confirm new password"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="settings-card danger-card">
//               <h2>Danger Zone</h2>
//               <p>
//                 Delete account option should be used carefully. This action can
//                 be connected with backend confirmation later.
//               </p>

//               <button
//                 type="button"
//                 className="delete-account-btn"
//                 onClick={handleDeleteAccount}
//               >
//                 Delete Account
//               </button>
//             </div>
//           </section>

//           <aside className="settings-right">
//             <div className="settings-card">
//               <h2>Profile Preferences</h2>

//               <div className="setting-row">
//                 <div>
//                   <h3>Public Profile</h3>
//                   <p>Allow people to view your profile after scanning QR.</p>
//                 </div>

//                 <button
//                   type="button"
//                   className={
//                     preferences.publicProfile
//                       ? "settings-toggle active"
//                       : "settings-toggle"
//                   }
//                   onClick={() => togglePreference("publicProfile")}
//                 >
//                   <span></span>
//                 </button>
//               </div>

//               <div className="default-qr-section">
//                 <label>Default QR Type</label>

//                 <div className="default-qr-options">
//                   {["Online", "vCard"].map((item) => (
//                     <button
//                       key={item}
//                       type="button"
//                       className={
//                         preferences.defaultQR === item ? "active" : ""
//                       }
//                       onClick={() =>
//                         setPreferences({
//                           ...preferences,
//                           defaultQR: item,
//                         })
//                       }
//                     >
//                       {item}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="settings-card">
//               <h2>Notifications</h2>

//               <div className="setting-row">
//                 <div>
//                   <h3>Email Notifications</h3>
//                   <p>Receive updates and important notices by email.</p>
//                 </div>

//                 <button
//                   type="button"
//                   className={
//                     preferences.emailNotifications
//                       ? "settings-toggle active"
//                       : "settings-toggle"
//                   }
//                   onClick={() => togglePreference("emailNotifications")}
//                 >
//                   <span></span>
//                 </button>
//               </div>

//               <div className="setting-row">
//                 <div>
//                   <h3>Order Updates</h3>
//                   <p>Get notified when your printing order status changes.</p>
//                 </div>

//                 <button
//                   type="button"
//                   className={
//                     preferences.orderUpdates
//                       ? "settings-toggle active"
//                       : "settings-toggle"
//                   }
//                   onClick={() => togglePreference("orderUpdates")}
//                 >
//                   <span></span>
//                 </button>
//               </div>
//             </div>

//             <div className="settings-save-card">
//               <button
//                 type="submit"
//                 className="save-settings-btn"
//                 disabled={!isAccountValid}
//               >
//                 Save Settings
//               </button>

//               {message && (
//                 <p
//                   className={
//                     messageType === "success"
//                       ? "settings-message success-message"
//                       : "settings-message error-message"
//                   }
//                 >
//                   {message}
//                 </p>
//               )}
//             </div>
//           </aside>
//         </form>
//       </main>
//     </div>
//   );
// };

// export default Settings;



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import ConfirmModal from "../../Component/ConfirmModal";
import "../../CSS/User/Settings.css";
import { API_URL, getHeaders } from "../../config/api";

const Settings = () => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
    darkMode: localStorage.getItem("theme") === "dark",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const selectedTheme = preferences.darkMode ? "dark" : "light";

    document.documentElement.setAttribute(
      "data-theme",
      selectedTheme
    );

    localStorage.setItem("theme", selectedTheme);
  }, [preferences.darkMode]);

  const isAccountValid =
    accountData.fullName.trim() &&
    accountData.email.trim();

  const handleAccountChange = (event) => {
    const { name, value } = event.target;

    setMessage("");

    if (name === "fullName") {
      const lettersOnly = value.replace(
        /[^a-zA-Z\s.'-]/g,
        ""
      );

      setAccountData((previousData) => ({
        ...previousData,
        fullName: lettersOnly,
      }));

      return;
    }

    setAccountData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const togglePreference = (key) => {
    setPreferences((previousPreferences) => ({
      ...previousPreferences,
      [key]: !previousPreferences[key],
    }));
  };

  const handleDefaultQRChange = (qrType) => {
    setPreferences((previousPreferences) => ({
      ...previousPreferences,
      defaultQR: qrType,
    }));
  };

  const handleSaveSettings = (event) => {
    event.preventDefault();

    if (!isAccountValid) {
      setMessage(
        "Please add your full name and email address."
      );
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
        setMessage(
          "New password must be at least 6 characters."
        );
        setMessageType("error");
        return;
      }

      if (
        accountData.newPassword !==
        accountData.confirmPassword
      ) {
        setMessage(
          "New password and confirm password do not match."
        );
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

  const handleDeleteAccountClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleteModalOpen(false);
    try {
      setMessage("");
      const response = await fetch(`${API_URL}/profile`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete account.");
      }

      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
    } catch (err) {
      setMessage(err.message || "An error occurred while deleting your account.");
      setMessageType("error");
    }
  };

  return (
    <div className="settings-page">
      <Sidebar />

      <main className="settings-main">
        <div className="settings-header">
          <h1>Settings</h1>

          <p>
            Manage your account, privacy, QR preferences,
            notifications, and appearance.
          </p>
        </div>

        <form
          className="settings-layout"
          onSubmit={handleSaveSettings}
        >
          <section className="settings-left">
            <div className="settings-card">
              <h2>Account Settings</h2>

              <p className="settings-card-subtitle">
                Update your basic account information.
              </p>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label htmlFor="settings-full-name">
                    Full Name
                  </label>

                  <input
                    id="settings-full-name"
                    type="text"
                    name="fullName"
                    value={accountData.fullName}
                    onChange={handleAccountChange}
                    placeholder="Alina Khatun"
                  />
                </div>

                <div className="settings-form-group">
                  <label htmlFor="settings-email">
                    Email Address
                  </label>

                  <input
                    id="settings-email"
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
                Change your password to keep your account
                secure.
              </p>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label htmlFor="current-password">
                    Current Password
                  </label>

                  <input
                    id="current-password"
                    type="password"
                    name="currentPassword"
                    value={accountData.currentPassword}
                    onChange={handleAccountChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </div>

                <div className="settings-form-group">
                  <label htmlFor="new-password">
                    New Password
                  </label>

                  <input
                    id="new-password"
                    type="password"
                    name="newPassword"
                    value={accountData.newPassword}
                    onChange={handleAccountChange}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                </div>

                <div className="settings-form-group full-settings-field">
                  <label htmlFor="confirm-password">
                    Confirm Password
                  </label>

                  <input
                    id="confirm-password"
                    type="password"
                    name="confirmPassword"
                    value={accountData.confirmPassword}
                    onChange={handleAccountChange}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <div className="settings-card danger-card">
              <h2>Danger Zone</h2>

              <p>
                Deleting your account will remove your
                profile, QR codes, designs, and orders.
              </p>

              <button
                type="button"
                className="delete-account-btn"
                onClick={handleDeleteAccountClick}
              >
                Delete Account
              </button>
            </div>
          </section>

          <aside className="settings-right">
            <div className="settings-card">
              <h2>Appearance</h2>

              <div className="setting-row">
                <div>
                  <h3>Dark Mode</h3>

                  <p>
                    Switch between light mode and dark mode.
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    preferences.darkMode
                      ? "settings-toggle active"
                      : "settings-toggle"
                  }
                  onClick={() =>
                    togglePreference("darkMode")
                  }
                  aria-label="Toggle dark mode"
                  aria-pressed={preferences.darkMode}
                >
                  <span></span>
                </button>
              </div>
            </div>

            <div className="settings-card">
              <h2>Profile Preferences</h2>

              <div className="setting-row">
                <div>
                  <h3>Public Profile</h3>

                  <p>
                    Allow people to view your profile after
                    scanning QR.
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    preferences.publicProfile
                      ? "settings-toggle active"
                      : "settings-toggle"
                  }
                  onClick={() =>
                    togglePreference("publicProfile")
                  }
                  aria-label="Toggle public profile"
                  aria-pressed={preferences.publicProfile}
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
                        preferences.defaultQR === item
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        handleDefaultQRChange(item)
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

                  <p>
                    Receive updates and important notices by
                    email.
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    preferences.emailNotifications
                      ? "settings-toggle active"
                      : "settings-toggle"
                  }
                  onClick={() =>
                    togglePreference(
                      "emailNotifications"
                    )
                  }
                  aria-label="Toggle email notifications"
                  aria-pressed={
                    preferences.emailNotifications
                  }
                >
                  <span></span>
                </button>
              </div>

              <div className="setting-row">
                <div>
                  <h3>Order Updates</h3>

                  <p>
                    Get notified when your printing order
                    status changes.
                  </p>
                </div>

                <button
                  type="button"
                  className={
                    preferences.orderUpdates
                      ? "settings-toggle active"
                      : "settings-toggle"
                  }
                  onClick={() =>
                    togglePreference("orderUpdates")
                  }
                  aria-label="Toggle order updates"
                  aria-pressed={preferences.orderUpdates}
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

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Account"
        message="Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone."
        confirmText="Delete Account"
        isDestructive={true}
      />
    </div>
  );
};

export default Settings;