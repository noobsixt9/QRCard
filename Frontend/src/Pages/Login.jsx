import React, { useState } from "react";
import Header from "../Component/Header";
import { NavLink, useNavigate } from "react-router-dom";
import "../CSS/Register.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
  e.preventDefault();

  if (!email.trim() || !password.trim()) {
    setError("Please enter email and password.");
    return;
  }

  // Demo admin login
  if (email === "admin@qrcard.com" && password === "admin123") {
    localStorage.setItem("userRole", "admin");
    localStorage.setItem("user", JSON.stringify({ name: "Admin" }));

    navigate("/admin-dashboard");
    return;
  }

  // Demo normal user login
  localStorage.setItem("userRole", "user");
  localStorage.setItem("user", JSON.stringify({ name: "User" }));

  const redirectPath = localStorage.getItem("afterLoginRedirect");

  if (redirectPath) {
    localStorage.removeItem("afterLoginRedirect");
    navigate(redirectPath);
    return;
  }

  navigate("/dashboard");
};

  return (
    <div className="page-wrapper">
      <Header />

      <main className="auth-container">
        <section className="auth-sidebar">
          <h2>Welcome back to QRCard</h2>

          <p>
            Login to manage your profile, QR codes, visiting card designs, and
            printing orders.
          </p>

          <div className="mini-card-preview-login">
            <h4>Your QRCard is ready</h4>
            <p>Update once. Share anytime.</p>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="form-box">
            <h2>Login</h2>

            <p className="form-subtitle">
              Access your digital visiting card dashboard
            </p>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />
              </div>

              <div className="forgot-password-link">
                <a href="#forgot">Forgot Password?</a>
              </div>

              {error && <p className="auth-error-message">{error}</p>}

              <button type="submit" className="btn-auth-primary">
                Login
              </button>

              <div className="auth-switch-text">
                <span>Don't have an account? </span>
                <NavLink to="/register">Create Account</NavLink>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;