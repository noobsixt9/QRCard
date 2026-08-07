import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import RecaptchaWidget, { useRecaptchaScript } from "../Component/RecaptchaWidget";
import "../CSS/Register.css";
import { API_URL } from "../config/api";
import { getDefaultRouteForRole } from "../utils/auth";

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const recaptchaRef = useRef(null);
  useRecaptchaScript();

  // Already logged in → go to correct dashboard
  useEffect(() => {
    if (localStorage.getItem("token")) {
      const role = localStorage.getItem("userRole") || "";
      navigate(role === "admin" || role === "ADMIN" ? "/admin-dashboard" : "/dashboard", { replace: true });
    }
  }, [navigate]);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const redirectAfterLogin = (userRole) => {
    const role     = userRole?.toUpperCase?.() || userRole;
    const fromPath = location.state?.from;
    if (fromPath && !["/login", "/register"].includes(fromPath)) {
      if (fromPath.startsWith("/admin") && role !== "ADMIN") {
        navigate(getDefaultRouteForRole(role), { replace: true });
        return;
      }
      navigate(fromPath, { replace: true });
      return;
    }
    const redirectPath = localStorage.getItem("afterLoginRedirect");
    if (redirectPath) {
      localStorage.removeItem("afterLoginRedirect");
      navigate(redirectPath, { replace: true });
      return;
    }
    navigate(getDefaultRouteForRole(role), { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError("Please enter email and password."); return; }

    const recaptchaToken = recaptchaRef.current?.getToken();
    if (!recaptchaToken) { setError("Please check the reCAPTCHA box to verify you are human."); return; }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptchaToken }),
      });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403 && result.message?.toLowerCase().includes("verify")) {
          navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}&purpose=REGISTRATION`);
          return;
        }
        const msg = result.errors?.[0]?.message || result.message || "Login failed.";
        throw new Error(msg);
      }

      const token = result.data?.token;
      const user  = result.data?.user;
      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role?.toLowerCase());
      }
      redirectAfterLogin(user?.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset(); // always reset after any submission attempt
    }
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setError("");
    setResetEmail(email.trim());
    setShowForgotPassword(true);
    recaptchaRef.current?.reset();
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!resetEmail.trim()) { setError("Please enter your email address."); return; }

    const recaptchaToken = recaptchaRef.current?.getToken();
    if (!recaptchaToken) { setError("Please check the reCAPTCHA box to verify you are human."); return; }

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail.trim(), recaptchaToken }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to send reset OTP.");
      navigate(`/verify-otp?email=${encodeURIComponent(resetEmail.trim())}&purpose=PASSWORD_RESET`);
    } catch (err) {
      setError(err.message);
    } finally {
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
      if (!response.ok) throw new Error(result.message || "Google login failed.");
      const { token, user } = result.data || {};
      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role?.toLowerCase());
        redirectAfterLogin(user.role);
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err) {
      setError(err.message || "Google login failed. Please try again.");
    }
  };

  return (
    <div className="page-wrapper register-page">
      <main className="auth-container">
        <section className="auth-sidebar">
          <div className="auth-sidebar-top">
            <div className="auth-logo">QRCARD</div>
            <h2>Welcome back</h2>
            <p>Log in to manage your digital profile, QR codes, card designs, and printing orders.</p>
          </div>
          <div className="mini-card-preview-login">
            <div className="mini-preview-icon">⚡</div>
            <div>
              <h4>Your QRCard is live</h4>
              <p>Update once. Share anytime, anywhere.</p>
            </div>
          </div>
          <div className="auth-sidebar-features">
            <div className="sidebar-feature"><span>✓</span> Online &amp; Offline QR Codes</div>
            <div className="sidebar-feature"><span>✓</span> AI Bio Generator</div>
            <div className="sidebar-feature"><span>✓</span> Physical Card Printing</div>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="form-box">
            {!showForgotPassword ? (
              <>
                <h2>Login</h2>
                <p className="form-subtitle">Access your digital visiting card dashboard</p>

                <form onSubmit={handleLogin}>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="Enter your email" value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }} />
                  </div>

                  <div className="input-group">
                    <label>Password</label>
                    <input type="password" placeholder="Enter your password" value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }} />
                  </div>

                  <div className="forgot-password-link">
                    <a href="#forgot" onClick={handleForgotPasswordClick}>Forgot Password?</a>
                  </div>

                  <div className="input-group recaptcha-wrapper" style={{ margin: "14px 0" }}>
                    <RecaptchaWidget ref={recaptchaRef} widgetKey="login" />
                  </div>

                  {error && <p className="auth-error-message">{error}</p>}

                  <button type="submit" className="btn-auth-primary" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </button>

                  <div className="auth-divider"><span>or</span></div>

                  <div className="google-login-wrapper">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => setError("Google login failed. Please try again.")}
                      text="continue_with" shape="rectangular" width="100%"
                    />
                  </div>

                  <div className="auth-switch-text">
                    <span>Don't have an account? </span>
                    <NavLink to="/register">Create Account</NavLink>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2>Forgot Password</h2>
                <p className="form-subtitle">We'll send you an OTP to verify and reset your password</p>

                <form onSubmit={handleForgotPasswordSubmit}>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="Enter your email address" value={resetEmail}
                      onChange={(e) => { setResetEmail(e.target.value); setError(""); }} required />
                  </div>

                  <div className="input-group recaptcha-wrapper" style={{ margin: "14px 0" }}>
                    <RecaptchaWidget ref={recaptchaRef} widgetKey="forgot" />
                  </div>

                  {error && <p className="auth-error-message">{error}</p>}

                  <button type="submit" className="btn-auth-primary">Send Reset OTP</button>

                  <div className="auth-switch-text" style={{ marginTop: "20px" }}>
                    <a href="#login" onClick={(e) => { e.preventDefault(); setError(""); setShowForgotPassword(false); recaptchaRef.current?.reset(); }}>
                      Back to Login
                    </a>
                  </div>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
