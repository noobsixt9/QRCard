// import React, { useState } from "react";
// import Header from "../Component/Header";
// import { NavLink, useNavigate } from "react-router-dom";
// import "../CSS/Register.css";

// const Login = () => {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleLogin = (e) => {
//   e.preventDefault();

//   if (!email.trim() || !password.trim()) {
//     setError("Please enter email and password.");
//     return;
//   }

//   // Demo admin login
//   if (email === "admin@qrcard.com" && password === "admin123") {
//     localStorage.setItem("userRole", "admin");
//     localStorage.setItem("user", JSON.stringify({ name: "Admin" }));

//     navigate("/admin-dashboard");
//     return;
//   }

//   // Demo normal user login
//   localStorage.setItem("userRole", "user");
//   localStorage.setItem("user", JSON.stringify({ name: "User" }));

//   const redirectPath = localStorage.getItem("afterLoginRedirect");

//   if (redirectPath) {
//     localStorage.removeItem("afterLoginRedirect");
//     navigate(redirectPath);
//     return;
//   }

//   navigate("/dashboard");
// };

//   return (
//     <div className="page-wrapper">
//       <Header />

//       <main className="auth-container">
//         <section className="auth-sidebar">
//           <h2>Welcome back to QRCard</h2>

//           <p>
//             Login to manage your profile, QR codes, visiting card designs, and
//             printing orders.
//           </p>

//           <div className="mini-card-preview-login">
//             <h4>Your QRCard is ready</h4>
//             <p>Update once. Share anytime.</p>
//           </div>
//         </section>

//         <section className="auth-form-section">
//           <div className="form-box">
//             <h2>Login</h2>

//             <p className="form-subtitle">
//               Access your digital visiting card dashboard
//             </p>

//             <form onSubmit={handleLogin}>
//               <div className="input-group">
//                 <label>Email Address</label>
//                 <input
//                   type="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => {
//                     setEmail(e.target.value);
//                     setError("");
//                   }}
//                 />
//               </div>

//               <div className="input-group">
//                 <label>Password</label>
//                 <input
//                   type="password"
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => {
//                     setPassword(e.target.value);
//                     setError("");
//                   }}
//                 />
//               </div>

//               <div className="forgot-password-link">
//                 <a href="#forgot">Forgot Password?</a>
//               </div>

//               {error && <p className="auth-error-message">{error}</p>}

//               <button type="submit" className="btn-auth-primary">
//                 Login
//               </button>

//               <div className="auth-switch-text">
//                 <span>Don't have an account? </span>
//                 <NavLink to="/register">Create Account</NavLink>
//               </div>
//             </form>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// };

import { useState } from "react";
import Header from "../Component/Header";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "../CSS/Register.css";
import { API_URL } from "../config/api";
import { getDefaultRouteForRole } from "../utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const redirectAfterLogin = (userRole) => {
    const role = userRole?.toUpperCase?.() || userRole;
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

  async function sendData() {
    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password: password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403 && result.message?.toLowerCase().includes("verify")) {
          navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}&purpose=REGISTRATION`);
          return;
        }
        const errorMessage = result.errors && result.errors.length > 0
          ? result.errors[0].message
          : (result.message || "Login failed.");
        throw new Error(errorMessage);
      }

      const token = result.data?.token;
      const user = result.data?.user;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role?.toLowerCase());
      }

      redirectAfterLogin(user?.role);
    } catch (error) {
      console.error("Login error:", error.message);
      setError(error.message);
    }
  }

  async function sendForgotPasswordRequest(emailToReset) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailToReset,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to send reset OTP.");
    }

    navigate(`/verify-otp?email=${encodeURIComponent(emailToReset)}&purpose=PASSWORD_RESET`);
  }

  const handleForgotPasswordClick = async (e) => {
    e.preventDefault();
    setError("");

    if (email.trim()) {
      try {
        await sendForgotPasswordRequest(email.trim());
      } catch (err) {
        setError(err.message);
      }
    } else {
      setShowForgotPassword(true);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!resetEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      await sendForgotPasswordRequest(resetEmail.trim());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    await sendData();
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setError("");

      if (!credentialResponse.credential) {
        setError("Google login failed. Please try again.");
        return;
      }

      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Google login failed.");
      }

      const token = result.data?.token;
      const user = result.data?.user;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role?.toLowerCase());

        redirectAfterLogin(user.role?.toLowerCase());
      } else {
        throw new Error("Invalid response payload from server.");
      }
    } catch (err) {
      setError(err.message || "Google login failed. Please try again.");
    }
  };

  return (
    <div className="page-wrapper register-page">
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
            {!showForgotPassword ? (
              <>
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
                    <a href="#forgot" onClick={handleForgotPasswordClick}>Forgot Password?</a>
                  </div>



                  {error && <p className="auth-error-message">{error}</p>}

                  <button type="submit" className="btn-auth-primary">
                    Login
                  </button>

                  <div className="auth-divider">
                    <span>or</span>
                  </div>

                  <div className="google-login-wrapper">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() =>
                        setError("Google login failed. Please try again.")
                      }
                      text="continue_with"
                      shape="rectangular"
                      width="100%"
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

                <p className="form-subtitle">
                  We'll send you an OTP to verify and reset your password
                </p>

                <form onSubmit={handleForgotPasswordSubmit}>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setError("");
                      }}
                      required
                    />
                  </div>



                  {error && <p className="auth-error-message">{error}</p>}

                  <button type="submit" className="btn-auth-primary">
                    Send Reset OTP
                  </button>

                  <div className="auth-switch-text" style={{ marginTop: "20px" }}>
                    <a
                      href="#login"
                      onClick={(e) => {
                        e.preventDefault();
                        setError("");
                        setShowForgotPassword(false);
                      }}
                    >
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