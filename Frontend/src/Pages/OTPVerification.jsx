import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import "../CSS/Register.css";
import "../CSS/VerifyOTP.css";
import { API_URL } from "../config/api";


const OTPVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const purpose = searchParams.get("purpose") || "REGISTRATION"; // REGISTRATION or PASSWORD_RESET

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResetFlow, setIsResetFlow] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const inputRefs = useRef([]);

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Fallback to Google test key

  useEffect(() => {
    // Dynamically load Google reCAPTCHA v2 script
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Countdown timer for resending OTP
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }

    return () => {
      document.body.removeChild(script);
      if (timer) clearTimeout(timer);
    };
  }, [resendCountdown]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").trim();
    if (data.length === 6 && !isNaN(data)) {
      const otpArray = data.split("");
      setOtp(otpArray);
      inputRefs.current[5].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    // Get reCAPTCHA response token
    const recaptchaToken = window.grecaptcha?.getResponse();
    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA verification.");
      return;
    }

    setLoading(true);

    try {
      // Use the correct endpoint per purpose
      const endpoint = purpose === "REGISTRATION"
        ? `${API_URL}/auth/register/verify-otp`
        : `${API_URL}/auth/verify-otp`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp:  purpose === "REGISTRATION" ? otpCode : undefined,
          code: purpose !== "REGISTRATION" ? otpCode : undefined,
          purpose,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Verification failed");
      }

      setSuccess("OTP Verified Successfully!");

      if (purpose === "REGISTRATION") {
        const token = result.data?.token;
        const user  = result.data?.user;
        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("userRole", user.role?.toLowerCase());
        }
        setTimeout(() => navigate("/dashboard"), 1500);
      } else if (purpose === "PASSWORD_RESET") {
        setResetToken(result.data?.reset_token || result.data?.token || "");
        setIsResetFlow(true);
      }
    } catch (err) {
      setError(err.message);
      // Reset reCAPTCHA widget
      window.grecaptcha?.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setOtp(["", "", "", "", "", ""]);
    window.grecaptcha?.reset();

    try {
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          purpose,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to resend OTP");
      }

      setSuccess("A new OTP has been sent to your email.");
      setResendCountdown(60);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          password: newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to reset password");
      }

      setSuccess("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="auth-container">
        <section className="auth-sidebar">
          <h2>Security Verification</h2>
          <p>
            We take your security seriously. Please complete the OTP and reCAPTCHA checks to continue.
          </p>
          <div className="mini-card-preview-login">
            <h4>Update once. Share anytime.</h4>
            <p>Your secure digital business card is just a step away.</p>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="form-box">
            {!isResetFlow ? (
              <>
                <h2>Verify OTP</h2>
                <p className="form-subtitle">
                  We've sent a 6-digit OTP code to <strong>{email || "your email"}</strong>
                </p>

                <form onSubmit={handleVerify}>
                  <div className="otp-inputs-wrapper" onPaste={handlePaste}>
                    {otp.map((data, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        ref={(el) => (inputRefs.current[index] = el)}
                        value={data}
                        onChange={(e) => handleChange(e.target, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="otp-input-field"
                      />
                    ))}
                  </div>

                  <div className="recaptcha-outer-container">
                    <div className="g-recaptcha" data-sitekey={siteKey}></div>
                  </div>

                  {error && <p className="auth-error-message">{error}</p>}
                  {success && <p className="auth-success-message">{success}</p>}

                  <button
                    type="submit"
                    className="btn-auth-primary"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify & Proceed"}
                  </button>

                  <div className="otp-resend-section">
                    {resendCountdown > 0 ? (
                      <p className="countdown-text">
                        Resend OTP in <span>{resendCountdown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="btn-resend-otp"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2>Reset Password</h2>
                <p className="form-subtitle">Choose a strong password for your account</p>

                <form onSubmit={handlePasswordReset}>
                  <div className="input-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password (min 8 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && <p className="auth-error-message">{error}</p>}
                  {success && <p className="auth-success-message">{success}</p>}

                  <button
                    type="submit"
                    className="btn-auth-primary"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Reset Password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default OTPVerification;
