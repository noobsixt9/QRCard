import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import RecaptchaWidget, { useRecaptchaScript } from "../Component/RecaptchaWidget";
import { API_URL } from "../config/api";
import "../CSS/Register.css";

const VerifyHuman = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const purpose = searchParams.get("purpose") || "REGISTRATION"; // REGISTRATION or GOOGLE_LOGIN

  const recaptchaRef = useRef(null);
  useRecaptchaScript();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Validate that we have the necessary pending data before proceeding
    if (purpose === "REGISTRATION") {
      const pendingData = sessionStorage.getItem("pendingRegistration");
      if (!pendingData) {
        navigate("/register");
      }
    } else if (purpose === "GOOGLE_LOGIN") {
      const pendingCred = sessionStorage.getItem("pendingGoogleCredential");
      if (!pendingCred) {
        navigate("/register");
      }
    } else {
      navigate("/register");
    }
  }, [purpose, navigate]);

  const handleVerify = async (e, directToken = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccess("");

    const recaptchaToken = directToken || recaptchaRef.current?.getToken();
    if (!recaptchaToken) {
      setError("Please check the box to verify you are human.");
      return;
    }

    setLoading(true);

    try {
      if (purpose === "REGISTRATION") {
        const pendingDataStr = sessionStorage.getItem("pendingRegistration");
        if (!pendingDataStr) {
          throw new Error("Registration session expired. Please register again.");
        }

        const formData = JSON.parse(pendingDataStr);
        const email = formData.email.trim();

        // Generate username
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
            fullName: formData.fullName,
            phone: formData.phone,
            username,
            email,
            password: formData.password,
            recaptchaToken,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          const errorMessage = result.errors && result.errors.length > 0
            ? result.errors[0].message
            : (result.message || "Registration failed.");
          throw new Error(errorMessage);
        }

        setSuccess("Verification successful! Account created.");
        
        const token = result.data?.token;
        const user = result.data?.user;

        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("userRole", user.role?.toLowerCase());
          sessionStorage.removeItem("pendingRegistration");

          setTimeout(() => {
            if (user.role === "ADMIN") {
              navigate("/admin-dashboard");
            } else {
              navigate("/dashboard");
            }
          }, 1500);
        } else {
          throw new Error("Invalid response payload from server.");
        }
        return;
      }

      if (purpose === "GOOGLE_LOGIN") {
        const pendingCred = sessionStorage.getItem("pendingGoogleCredential");
        if (!pendingCred) {
          throw new Error("Google login session expired. Please try again.");
        }

        const response = await fetch(`${API_URL}/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: pendingCred,
            recaptchaToken,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          const errorMessage = result.errors && result.errors.length > 0
            ? result.errors[0].message
            : (result.message || "Google registration failed.");
          throw new Error(errorMessage);
        }

        setSuccess("Verification successful! Logging you in...");
        const token = result.data?.token;
        const user = result.data?.user;

        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("userRole", user.role?.toLowerCase());
          sessionStorage.removeItem("pendingGoogleCredential");

          setTimeout(() => {
            if (user.role === "ADMIN") {
              navigate("/admin-dashboard");
            } else {
              navigate("/dashboard");
            }
          }, 1500);
        } else {
          throw new Error("Invalid response payload from server.");
        }
        return;
      }
    } catch (err) {
      setError(err.message);
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper register-page">
      <Header />

      <main className="auth-container">
        <section className="auth-form-section" style={{ width: "100%", maxWidth: "450px", margin: "0 auto" }}>
          <div className="form-box" style={{ minHeight: "auto", padding: "40px 30px" }}>
            <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Security Check</h2>
            <p className="form-subtitle" style={{ textAlign: "center", marginBottom: "30px" }}>
              Please verify that you are a human to continue setup.
            </p>

            <form onSubmit={handleVerify}>
              <RecaptchaWidget ref={recaptchaRef} onVerify={(token) => handleVerify(null, token)} />

              {error && <p className="auth-error-message" style={{ textAlign: "center", marginTop: "15px" }}>{error}</p>}
              {success && <p className="auth-success-message" style={{ textAlign: "center", marginTop: "15px", color: "#10b981" }}>{success}</p>}

              <button
                type="submit"
                className="btn-register-primary"
                disabled={loading}
                style={{ marginTop: "25px", width: "100%" }}
              >
                {loading ? "Verifying..." : "Verify & Proceed"}
              </button>

              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <a
                  href="#back"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/register");
                  }}
                  style={{ color: "#4f6bed", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}
                >
                  Back to Registration
                </a>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VerifyHuman;
