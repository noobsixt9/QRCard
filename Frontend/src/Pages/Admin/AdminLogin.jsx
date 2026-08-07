import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";
import RecaptchaWidget, { useRecaptchaScript } from "../../Component/RecaptchaWidget";
import "../../CSS/Admin/AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  useRecaptchaScript();

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg]     = useState("");

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("token");
    if (token && role === "ADMIN") {
      navigate("/admin-dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Get reCAPTCHA token
    const recaptchaToken = recaptchaRef.current?.getToken?.() || "";

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, recaptchaToken }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Login failed. Please try again.");
      }

      const { token, user } = result.data || result;

      // Verify this is an admin account
      if (user?.role !== "ADMIN") {
        throw new Error("Access denied. This portal is for administrators only.");
      }

      // Store session
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/admin-dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset?.();
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMsg("");
    if (!resetEmail.trim()) { setError("Please enter your email address."); return; }
    try {
      const recaptchaToken = recaptchaRef.current?.getToken?.() || "";
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail.trim(), recaptchaToken }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to send reset OTP.");
      navigate(`/verify-otp?email=${encodeURIComponent(resetEmail.trim())}&purpose=PASSWORD_RESET`);
    } catch (err) {
      setError(err.message);
    } finally {
      recaptchaRef.current?.reset?.();
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        {/* Left panel */}
        <div className="admin-login-left">
          <div className="admin-login-brand">
            <div className="admin-login-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 18h3v3h-3zM18 14h3v3h-3z"/>
              </svg>
            </div>
            <span className="admin-login-brand-name">QRCard</span>
          </div>

          <div className="admin-login-hero">
            <h1>Admin Portal</h1>
            <p>Manage users, process orders, and control the platform from one place.</p>
          </div>

          <ul className="admin-login-features">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              User management & role control
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Order processing & tracking
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1"/>
                <circle cx="7" cy="18" r="1"/>
                <circle cx="18" cy="18" r="1"/>
              </svg>
              Vendor delivery management
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Secure, role-restricted access
            </li>
          </ul>
        </div>

        {/* Right panel */}
        <div className="admin-login-right">
          <div className="admin-login-form-wrap">
            {showForgot ? (
              <>
                <div className="admin-login-form-header">
                  <h2>Reset Password</h2>
                  <p>Enter your admin email to receive a reset OTP.</p>
                </div>
                <form className="admin-login-form" onSubmit={handleForgotPassword}>
                  <div className="admin-field">
                    <label htmlFor="reset-email">Email Address</label>
                    <div className="admin-input-wrap">
                      <svg className="admin-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <input id="reset-email" type="email" value={resetEmail}
                        onChange={e => { setResetEmail(e.target.value); setError(""); }}
                        placeholder="admin@qrcard.com" required />
                    </div>
                  </div>
                  <div className="admin-recaptcha-wrap">
                    <RecaptchaWidget ref={recaptchaRef} widgetKey="admin-forgot" />
                  </div>
                  {error && (
                    <div className="admin-login-error">{error}</div>
                  )}
                  <button type="submit" className="admin-login-btn" disabled={loading}>
                    Send Reset OTP →
                  </button>
                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    <button type="button" className="admin-back-link"
                      onClick={() => { setShowForgot(false); setError(""); recaptchaRef.current?.reset?.(); }}>
                      ← Back to sign in
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
            <div className="admin-login-form-header">
              <h2>Sign in</h2>
              <p>Enter your administrator credentials to continue.</p>
            </div>

            <form className="admin-login-form" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="admin-field">
                <label htmlFor="admin-email">Email address</label>
                <div className="admin-input-wrap">
                  <svg className="admin-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@qrcard.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="admin-field">
                <label htmlFor="admin-password">Password</label>
                <div className="admin-input-wrap">
                  <svg className="admin-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* reCAPTCHA */}
              <div className="admin-recaptcha-wrap">
                <RecaptchaWidget ref={recaptchaRef} widgetKey="admin-login" />
              </div>

              {/* Error */}
              {error && (
                <div className="admin-login-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="admin-login-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="admin-btn-spinner" />
                ) : (
                  <>
                    Sign In
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="admin-login-back" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a href="/login">← Back to user login</a>
              <button type="button" className="admin-back-link"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 13, fontWeight: 600 }}
                onClick={() => { setShowForgot(true); setResetEmail(email); setError(""); recaptchaRef.current?.reset?.(); }}>
                Forgot password?
              </button>
            </div>
            </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
