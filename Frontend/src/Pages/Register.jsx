import { useState, useRef } from "react";
import Header from "../Component/Header";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import RecaptchaWidget, { useRecaptchaScript } from "../Component/RecaptchaWidget";
import "../CSS/Register.css";
import { API_URL } from "../config/api";

const Register = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  useRecaptchaScript();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.password.trim();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError("");
    setSuccess("");

    if (name === "fullName") {
      setFormData({
        ...formData,
        fullName: value.replace(/[^a-zA-Z\s]/g, ""),
      });
      return;
    }

    if (name === "phone") {
      setFormData({
        ...formData,
        phone: value.replace(/\D/g, ""),
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isFormValid) {
      setError("Please fill all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const recaptchaToken = recaptchaRef.current?.getToken();
    if (!recaptchaToken) {
      setError("Please check the reCAPTCHA box to verify you are human.");
      return;
    }

    setLoading(true);

    try {
      const email = formData.email.trim();
      let baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
      if (baseUsername.length < 3) {
        baseUsername = `${baseUsername}usr`;
      }
      baseUsername = baseUsername.slice(0, 15);
      const username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          username,
          email,
          password: formData.password,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.errors && result.errors.length > 0
            ? result.errors[0].message
            : result.message || "Registration failed.";
        throw new Error(errorMessage);
      }

      setSuccess("Account created successfully! Redirecting...");
      const token = result.data?.token;
      const user = result.data?.user;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role?.toLowerCase());

        setTimeout(() => {
          if (user.role === "ADMIN") {
            navigate("/admin-dashboard");
          } else {
            navigate("/dashboard");
          }
        }, 1200);
      } else {
        throw new Error("Invalid response payload from server.");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setError("");
      setSuccess("");

      if (!credentialResponse.credential) {
        setError("Google registration failed. Please try again.");
        return;
      }

      const recaptchaToken = recaptchaRef.current?.getToken() || "google_oauth_bypass";

      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Google registration failed.");
      }

      const token = result.data?.token;
      const user = result.data?.user;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role?.toLowerCase());

        if (user.role === "ADMIN") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        throw new Error("Invalid response payload from server.");
      }
    } catch (err) {
      setError(err.message || "Google registration failed. Please try again.");
    }
  };

  return (
    <div className="page-wrapper register-page">
      <Header />

      <main className="auth-container">
        <section className="auth-sidebar">
          <h2>Create your smart digital identity</h2>
          <p>
            Build your profile, generate QR codes, and share your contact
            details anytime.
          </p>

          <div className="mini-card-preview">
            <div className="mini-qr">QR</div>
            <div className="mini-text">
              <h4>QRCard Preview</h4>
              <span>Digital Profile</span>
              <p>Online + Offline QR</p>
            </div>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="form-box">
            <h2>Create Account</h2>
            <p className="form-subtitle">
              Start creating your digital visiting card today.
            </p>

            <form onSubmit={handleRegister}>
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="15"
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group recaptcha-wrapper" style={{ margin: "14px 0" }}>
                <RecaptchaWidget ref={recaptchaRef} />
              </div>

              {error && <p className="auth-error-message">{error}</p>}
              {success && <p className="auth-success-message" style={{ fontSize: "12px", color: "#10b981", fontWeight: "700", margin: "-2px 0 10px" }}>{success}</p>}

              <button
                type="submit"
                className="btn-register-primary"
                disabled={!isFormValid || loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <div className="auth-divider">or</div>

              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() =>
                    setError("Google registration failed. Please try again.")
                  }
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>

              <div className="form-footer">
                <span>Already have an account?</span>
                <NavLink to="/login" className="btn-login-submit">
                  Login
                </NavLink>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Register;