import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * VerifyHuman — reCAPTCHA checkpoint page.
 * Users are redirected here when suspicious activity is detected.
 * After passing the CAPTCHA they are sent back to the previous page.
 */
const VerifyHuman = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Verify — QRCard";
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "24px",
      background: "var(--bg-base)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-base)",
      padding: "40px 20px",
      textAlign: "center",
    }}>
      <h1 style={{ fontSize: "24px", fontWeight: 800 }}>Human Verification</h1>
      <p style={{ color: "var(--text-secondary)", maxWidth: "400px" }}>
        Please complete the verification below to continue.
      </p>
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: "12px 28px",
          background: "var(--accent)",
          color: "white",
          border: "none",
          borderRadius: "var(--r-md)",
          fontWeight: 700,
          fontSize: "15px",
          cursor: "pointer",
        }}
      >
        Continue
      </button>
    </div>
  );
};

export default VerifyHuman;
