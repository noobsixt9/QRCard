import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/User/CardDesign.css";

const CardDesign = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Design state
  const [qrType, setQrType] = useState("ONLINE");
  const [template, setTemplate] = useState("Minimal");
  const [themeColor, setThemeColor] = useState("#5b68e8"); // Blue
  const [font, setFont] = useState("inter");
  const [showAvatar, setShowAvatar] = useState(true);

  useEffect(() => {
    const fetchProfileAndQR = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const [profileRes, qrRes] = await Promise.all([
          fetch(`${API_URL}/profile`, {
            method: "GET",
            headers: getHeaders(),
          }),
          fetch(`${API_URL}/qr`, {
            method: "GET",
            headers: getHeaders(null),
          }),
        ]);

        const profileResult = await profileRes.json();
        if (profileRes.ok) {
          setProfile(profileResult.data?.profile || profileResult.data || {});
        } else {
          throw new Error(profileResult.message || "Failed to load profile details");
        }

        if (qrRes.ok) {
          const qrResult = await qrRes.json();
          setQrCodeData(qrResult.data);
        }
      } catch (err) {
        console.error("Fetch data error:", err.message);
        setError("Please complete your digital profile first to preview card details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndQR();
  }, [navigate]);

  const handlePlaceOrder = () => {
    const design = {
      template,
      primary_color: themeColor,
      secondary_color: "#ffffff",
      show_avatar: showAvatar,
      font,
    };
    
    // Save to local storage as active draft
    localStorage.setItem("qrCardActiveDesign", JSON.stringify({ design, qrType }));
    
    navigate("/printing-order", {
      state: { design, qrType }
    });
  };

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const host = API_URL.replace("/api", "");
    return `${host}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const getInitials = (name) => {
    if (!name) return "US";
    return name
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const activeQrUrl = qrType === "ONLINE"
    ? qrCodeData?.online?.qr_data_url
    : qrCodeData?.offline?.qr_data_url;

  return (
    <div className="card-design-page">
      <Sidebar />

      <main className="card-design-main">
        <div className="card-design-header">
          <h1>Visiting Card Design</h1>
          <p>
            Customize a minimal visiting card with your selected QR code and
            profile details.
          </p>
        </div>

        {loading ? (
          <div className="dashboard-loading" style={{ padding: "40px 0", textAlign: "center" }}>
            <p>Loading card design editor...</p>
          </div>
        ) : (
          <section className="card-design-layout">
            <aside className="customize-card">
              <h2>Customize Card</h2>

              {error && (
                <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "14px", borderRadius: "10px", marginBottom: "20px" }}>
                  <p style={{ color: "#b45309", fontSize: "13px", margin: 0 }}>{error}</p>
                  <button
                    type="button"
                    className="preview-card-btn"
                    style={{ marginTop: "10px", width: "100%", height: "36px", fontSize: "12px" }}
                    onClick={() => navigate("/digital-profile")}
                  >
                    Setup Profile
                  </button>
                </div>
              )}

              <div className="design-control-group">
                <label>QR Type</label>
                <div className="qr-type-options">
                  <button
                    type="button"
                    className={qrType === "ONLINE" ? "active" : ""}
                    onClick={() => setQrType("ONLINE")}
                  >
                    Online Profile
                  </button>
                  <button
                    type="button"
                    className={qrType === "OFFLINE" ? "active" : ""}
                    onClick={() => setQrType("OFFLINE")}
                  >
                    Offline vCard
                  </button>
                </div>
              </div>

              <div className="design-control-group">
                <label>Template Style</label>
                <div className="template-style-list">
                  {["Minimal", "Professional", "Creative"].map((style) => (
                    <button
                      key={style}
                      type="button"
                      className={template === style ? "active" : ""}
                      onClick={() => setTemplate(style)}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="design-control-group">
                <label>Color Theme</label>
                <div className="color-theme-row">
                  {[
                    { color: "#5b68e8", name: "blue" },
                    { color: "#7c3aed", name: "purple" },
                    { color: "#111827", name: "dark" },
                    { color: "#22c55e", name: "green" },
                  ].map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      className={`theme-dot ${item.name} ${themeColor === item.color ? "active" : ""}`}
                      style={{ background: item.color }}
                      onClick={() => setThemeColor(item.color)}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="design-control-group">
                <label>Font Family</label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  style={{ width: "100%", height: "40px", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "0 10px" }}
                >
                  <option value="inter">Inter (Modern)</option>
                  <option value="roboto">Roboto (Clean)</option>
                  <option value="outfit">Outfit (Stylish)</option>
                </select>
              </div>

              <div className="design-action-buttons">
                <button 
                  type="button" 
                  className="preview-card-btn" 
                  onClick={() => {
                    const previewEl = document.querySelector(".live-preview-card");
                    if (previewEl) previewEl.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Preview Card
                </button>
                <button type="button" className="print-order-btn" onClick={handlePlaceOrder}>
                  Place Print Order
                </button>
              </div>
            </aside>

            <section className="live-preview-card" style={{ fontFamily: font === "inter" ? "Inter" : font === "roboto" ? "Roboto" : "Outfit" }}>
              <h2>Live Preview</h2>
              <p>Front and back side preview of your visiting card.</p>

              <div className={`visiting-card-front template-${template.toLowerCase()}`} style={{ borderLeft: `6px solid ${themeColor}` }}>
                <div className="card-info">
                  <span className="card-brand" style={{ color: themeColor }}>QR Card</span>
                  <h3>{profile?.full_name || "Your Name"}</h3>
                  <p>{profile?.job_title || "Your Job Title"}</p>

                  <div className="card-contact">
                    <span>{profile?.phone || "+977 98XXXXXXX"}</span>
                    <span>{profile?.public_email || "your.email@example.com"}</span>
                    <span>{profile?.address || "Kathmandu, Nepal"}</span>
                  </div>
                </div>

                <div className="preview-qr-box" style={{ borderColor: themeColor, background: "#ffffff", padding: "4px" }}>
                  {activeQrUrl ? (
                    <img
                      src={activeQrUrl}
                      alt="QR Code"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        `${window.location.origin}/u/${profile?.user?.username || "username"}`
                      )}`}
                      alt="QR Code"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  )}
                </div>
              </div>

              <div className="visiting-card-back" style={{ background: themeColor, color: "white" }}>
                <h3>Scan to view my digital profile</h3>
                <p>{window.location.host}/u/{profile?.user?.username || "username"}</p>
              </div>
            </section>
          </section>
        )}
      </main>
    </div>
  );
};

export default CardDesign;