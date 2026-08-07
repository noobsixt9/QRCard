import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import RecaptchaWidget, { useRecaptchaScript } from "../Component/RecaptchaWidget";
import "../CSS/Register.css";
import { API_URL } from "../config/api";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

const Register = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  useRecaptchaScript();

  // Already logged in → go to correct dashboard
  useEffect(() => {
    if (localStorage.getItem("token")) {
      const role = localStorage.getItem("userRole") || "";
      navigate(role === "admin" || role === "ADMIN" ? "/admin-dashboard" : "/dashboard", { replace: true });
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    fullName: "", username: "", email: "", password: "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    if (name === "fullName") {
      setFormData(p => ({ ...p, fullName: value.replace(/[^a-zA-Z\s.'-]/g, "") }));
      return;
    }
    if (name === "username") {
      setFormData(p => ({ ...p, username: value.toLowerCase().replace(/[^a-z0-9_]/g, "") }));
      return;
    }
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("Please fill all required fields."); return;
    }
    if (formData.username.length < 3) { setError("Username must be at least 3 characters."); return; }
    if (!USERNAME_REGEX.test(formData.username)) { setError("Username can only contain letters, numbers, and underscores."); return; }
    if (formData.password.length < 8) { setError("Password must be at least 8 characters."); return; }

    const recaptchaToken = recaptchaRef.current?.getToken();
    if (!recaptchaToken) { setError("Please check the reCAPTCHA box to verify you are human."); return; }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          email:    formData.email.trim(),
          password: formData.password,
          recaptchaToken,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        const msg = result.errors?.[0]?.message || result.message || "Registration failed.";
        throw new Error(msg);
      }
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email.trim())}&purpose=REGISTRATION`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset();
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setError("");
      if (!credentialResponse.credential) { setError("Google login failed. Please try again."); return; }
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Google registration failed.");
      const { token, user } = result.data || {};
      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role?.toLowerCase());
        navigate(user.role === "ADMIN" ? "/admin-dashboard" : "/dashboard", { replace: true });
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err) {
      setError(err.message || "Google registration failed. Please try again.");
    }
  };

  return (
    <div className="page-wrapper register-page">
      <main className="auth-container">
        <section className="auth-sidebar">
          <div className="auth-sidebar-top">
            <div className="auth-logo">QRCARD</div>
            <h2>Create your digital identity</h2>
            <p>Build your profile, generate QR codes, and share your contact details with a single scan.</p>
          </div>
          <div className="mini-card-preview">
            <div className="mini-qr">QR</div>
            <div className="mini-text">
              <h4>Smart visiting card</h4>
              <p>Share online or offline — your choice.</p>
            </div>
          </div>
          <div className="auth-sidebar-features">
            <div className="sidebar-feature"><span>✓</span> Digital Profile Page</div>
            <div className="sidebar-feature"><span>✓</span> Online &amp; Offline QR Codes</div>
            <div className="sidebar-feature"><span>✓</span> AI Bio Generator</div>
            <div className="sidebar-feature"><span>✓</span> Physical Card Printing</div>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="form-box">
            <h2>Create Account</h2>
            <p className="form-subtitle">Join QRCard — it's free</p>

            <form onSubmit={handleRegister}>
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" name="fullName" placeholder="Rajan Kshedal"
                  value={formData.fullName} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label>Username</label>
                <input type="text" name="username" placeholder="rajan_k"
                  value={formData.username} onChange={handleChange} required />
                <span className="input-hint">Letters, numbers, underscores only</span>
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input type="email" name="email" placeholder="you@example.com"
                  value={formData.email} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input type="password" name="password" placeholder="Min. 8 characters"
                  value={formData.password} onChange={handleChange} required />
              </div>

              <div className="input-group recaptcha-wrapper" style={{ margin: "14px 0" }}>
                <RecaptchaWidget ref={recaptchaRef} widgetKey="register" />
              </div>

              {error && <p className="auth-error-message">{error}</p>}

              <button type="submit" className="btn-register-primary" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>

              <div className="auth-divider"><span>or</span></div>

              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => setError("Google registration failed. Please try again.")}
                  text="continue_with" shape="rectangular" width="100%"
                />
              </div>

              <div className="form-footer">
                <span>Already have an account?</span>
                <NavLink to="/login" className="btn-login-submit">Login</NavLink>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Register;
