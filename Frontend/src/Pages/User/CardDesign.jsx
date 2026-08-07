import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/User/CardDesign.css";

const COLOR_PRESETS = [
  { color: "#4f46e5", name: "Indigo"  },
  { color: "#0ea5e9", name: "Sky"     },
  { color: "#10b981", name: "Emerald" },
  { color: "#f59e0b", name: "Amber"   },
  { color: "#ef4444", name: "Red"     },
  { color: "#8b5cf6", name: "Violet"  },
  { color: "#ec4899", name: "Pink"    },
  { color: "#0f172a", name: "Slate"   },
];

const CardDesign = () => {
  const navigate = useNavigate();
  const [profile,    setProfile]    = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  // username lives on the user row, not the profile row
  const storedUsername = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}").username || ""; }
    catch { return ""; }
  })();

  // Design options
  const [qrType,      setQrType]      = useState("BOTH");
  const [themeColor,  setThemeColor]  = useState("#4f46e5");
  const [layout,      setLayout]      = useState("standard");
  const [fontStyle,   setFontStyle]   = useState("modern");
  const [cornerStyle, setCornerStyle] = useState("rounded");
  const [showLogo,    setShowLogo]    = useState(true);
  const [cardSide,    setCardSide]    = useState("front");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [pRes, qrRes] = await Promise.all([
          fetch(`${API_URL}/profile`,  { headers: getHeaders() }),
          fetch(`${API_URL}/qr`,       { headers: getHeaders() }),
        ]);
        if (pRes.ok)  { const r = await pRes.json();  setProfile(pRes.ok  ? (r.data?.profile || r.data || {}) : {}); }
        if (qrRes.ok) { const r = await qrRes.json(); setQrCodeData(r.data); }
      } catch { setError("Failed to load profile details."); }
      finally  { setLoading(false); }
    };
    load();
  }, []);

  const frontQrUrl = qrType === "OFFLINE"
    ? qrCodeData?.offline?.qr_data_url
    : qrCodeData?.online?.qr_data_url;
  const backQrUrl  = qrCodeData?.offline?.qr_data_url;
  const activeQrUrl = cardSide === "back" && qrType === "BOTH" ? backQrUrl : frontQrUrl;

  const getInitials = (name) => (name || "US").split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const fontFamily = fontStyle === "classic" ? "Georgia, serif"
    : fontStyle === "mono" ? "'Courier New', monospace"
    : "inherit";

  const cornerRadius = cornerStyle === "sharp" ? "4px" : "16px";

  const handleOrder = () => {
    const design = {
      theme_color:   themeColor,
      layout,
      font_style:    fontStyle,
      corner_style:  cornerStyle,
      show_logo:     showLogo,
      card_qr_type:  qrType,
      front_qr_url:  frontQrUrl  || null,
      back_qr_url:   backQrUrl   || null,
      profile_name:     profile?.full_name    || "",
      profile_title:    profile?.job_title    || "",
      profile_company:  profile?.company      || "",
      profile_phone:    profile?.phone        || "",
      profile_email:    profile?.public_email || "",
      profile_website:  (profile?.website || "").replace(/^https?:\/\//, ""),
      profile_username: storedUsername,
    };
    navigate("/printing-order", { state: { design } });
  };

  return (
    <div className="card-design-page">
      <Sidebar />

      <main className="card-design-main">
        <div className="card-design-header">
          <div>
            <h1>Card Design Studio</h1>
            <p>Customize your physical visiting card with scannable QR.</p>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-loading"><div className="spinner" /></div>
        ) : (
          <div className="card-design-layout">

            {/* ── Controls panel ── */}
            <aside className="customize-card">

              {/* QR on card */}
              <div className="design-control-group">
                <label>QR on Card</label>
                <div className="qr-type-options">
                  {[["ONLINE","Online"],["OFFLINE","vCard"],["BOTH","Both"]].map(([v,l]) => (
                    <button key={v} type="button" className={qrType === v ? "active" : ""} onClick={() => setQrType(v)}>{l}</button>
                  ))}
                </div>
                <span style={{ fontSize:"11px", color:"var(--text-tertiary)", marginTop:"6px", display:"block" }}>
                  {qrType === "BOTH" ? "Online QR front · vCard QR back" : qrType === "ONLINE" ? "Live profile link" : "Offline contact QR"}
                </span>
              </div>

              {/* Card Layout */}
              <div className="design-control-group">
                <label>Card Layout</label>
                <div className="template-style-list" style={{ flexDirection:"row" }}>
                  {[["standard","Standard"],["minimal","Minimal"]].map(([v,l]) => (
                    <button key={v} type="button" className={layout === v ? "active" : ""} onClick={() => setLayout(v)}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Accent color */}
              <div className="design-control-group">
                <label>Accent Color</label>
                <div className="color-theme-row">
                  {COLOR_PRESETS.map(({ color, name }) => (
                    <button key={color} type="button" className={`theme-dot${themeColor === color ? " active" : ""}`}
                      style={{ background: color }} title={name} onClick={() => setThemeColor(color)} aria-label={name} />
                  ))}
                </div>
              </div>

              {/* Font style */}
              <div className="design-control-group">
                <label>Font Style</label>
                <div className="template-style-list" style={{ flexDirection:"row" }}>
                  {[["modern","Modern"],["classic","Classic"],["mono","Mono"]].map(([v,l]) => (
                    <button key={v} type="button" className={fontStyle === v ? "active" : ""} onClick={() => setFontStyle(v)}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Card corners */}
              <div className="design-control-group">
                <label>Card Corners</label>
                <div className="template-style-list" style={{ flexDirection:"row" }}>
                  {[["rounded","Rounded"],["sharp","Sharp"]].map(([v,l]) => (
                    <button key={v} type="button" className={cornerStyle === v ? "active" : ""} onClick={() => setCornerStyle(v)}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Logo toggle */}
              <div className="design-control-group">
                <label style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span>Show Logo</span>
                  <button type="button" onClick={() => setShowLogo(v => !v)}
                    style={{ width:"42px", height:"24px", borderRadius:"12px", border:"none", cursor:"pointer",
                      background: showLogo ? "var(--accent)" : "var(--border-default)", padding:"3px", display:"flex",
                      alignItems:"center", transition:"background 0.2s" }}>
                    <span style={{ width:"18px", height:"18px", borderRadius:"50%", background:"white",
                      display:"block", transition:"transform 0.2s", transform: showLogo ? "translateX(18px)" : "translateX(0)",
                      boxShadow:"0 1px 3px rgba(0,0,0,0.3)" }} />
                  </button>
                </label>
              </div>

              {/* Preview side */}
              <div className="design-control-group">
                <label>Preview Side</label>
                <div className="template-style-list" style={{ flexDirection:"row" }}>
                  {[["front","Front"],["back","Back"]].map(([v,l]) => (
                    <button key={v} type="button" className={cardSide === v ? "active" : ""} onClick={() => setCardSide(v)}>{l}</button>
                  ))}
                </div>
              </div>

              <button type="button" className="print-order-btn" onClick={handleOrder} style={{ marginTop:"8px" }}>
                Order Prints →
              </button>
            </aside>

            {/* ── Live preview ── */}
            <section className="live-preview-card">
              <h2>{cardSide === "front" ? "Front Side" : "Back Side"} View</h2>

              {error && <p style={{ color:"var(--warning)", fontSize:"13px", margin:"-12px 0 8px" }}>{error}</p>}

              <div className="card-stage">
                {cardSide === "front" ? (
                  /* ══ FRONT — premium business card ══ */
                  <div
                    className="visiting-card-front"
                    style={{ "--stripe-color": themeColor, borderRadius: cornerRadius, fontFamily }}
                  >
                    {/* Top accent bar */}
                    <div className="card-top-bar" style={{ background: themeColor }} />

                    <div className="card-body-wrap">
                      {/* LEFT side */}
                      <div className="card-info">
                        {showLogo && (
                          <span className="card-brand" style={{ color: themeColor }}>QR CARD</span>
                        )}

                        <h3 className="card-name" style={{ fontFamily }}>
                          {profile?.full_name || "Your Name"}
                        </h3>

                        <p className="card-title" style={{ fontFamily }}>
                          {[profile?.job_title, profile?.company].filter(Boolean).join(" · ") || "Job Title"}
                        </p>

                        <div className="card-divider" style={{ background: themeColor }} />

                        {layout === "standard" && (
                          <div className="card-contact">
                            {profile?.phone        && <span><span className="cc-dot" style={{ background: themeColor }} />  {profile.phone}</span>}
                            {profile?.public_email && <span><span className="cc-dot" style={{ background: themeColor }} />  {profile.public_email}</span>}
                            {profile?.website      && <span><span className="cc-dot" style={{ background: themeColor }} />  {profile.website.replace(/^https?:\/\//, "")}</span>}
                          </div>
                        )}
                      </div>

                      {/* RIGHT side — QR */}
                      <div className="card-qr-side">
                        <div className="preview-qr-box" style={{ borderColor: `${themeColor}40` }}>
                          {activeQrUrl ? (
                            <img src={activeQrUrl} alt="QR Code" />
                          ) : (
                            <div className="qr-placeholder">
                              <svg viewBox="0 0 48 48" width="58" height="58" fill="none">
                                <rect x="2"  y="2"  width="18" height="18" rx="3" fill={themeColor} opacity="0.9"/>
                                <rect x="5"  y="5"  width="12" height="12" rx="1" fill="white" opacity="0.9"/>
                                <rect x="8"  y="8"  width="6"  height="6"  rx="1" fill={themeColor}/>
                                <rect x="28" y="2"  width="18" height="18" rx="3" fill={themeColor} opacity="0.7"/>
                                <rect x="31" y="5"  width="12" height="12" rx="1" fill="white" opacity="0.9"/>
                                <rect x="34" y="8"  width="6"  height="6"  rx="1" fill={themeColor}/>
                                <rect x="2"  y="28" width="18" height="18" rx="3" fill={themeColor} opacity="0.7"/>
                                <rect x="5"  y="31" width="12" height="12" rx="1" fill="white" opacity="0.9"/>
                                <rect x="8"  y="34" width="6"  height="6"  rx="1" fill={themeColor}/>
                                <rect x="28" y="28" width="6" height="6" rx="1" fill={themeColor} opacity="0.8"/>
                                <rect x="36" y="28" width="6" height="6" rx="1" fill={themeColor} opacity="0.6"/>
                                <rect x="28" y="36" width="6" height="6" rx="1" fill={themeColor} opacity="0.6"/>
                                <rect x="36" y="36" width="6" height="6" rx="1" fill={themeColor} opacity="0.4"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="card-qr-label" style={{ color: themeColor }}>SCAN ME</span>
                        <span className="card-url" style={{ color: `${themeColor}bb` }}>
                          qrcard.dev/u/{storedUsername || "you"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ══ BACK — solid color with QR centered ══ */
                  <div
                    className="visiting-card-back"
                    style={{ background: themeColor, borderRadius: cornerRadius }}
                  >
                    {/* Noise/grain texture via SVG filter is CSS-only; use radial overlays */}
                    <div className="card-back-glow" />

                    <div className="card-back-logo" style={{ fontFamily }}>
                      {showLogo && <span className="cb-brand">QR CARD</span>}
                      <span className="cb-name" style={{ fontFamily }}>
                        {profile?.full_name || "Your Name"}
                      </span>
                    </div>

                    {qrType === "BOTH" && backQrUrl ? (
                      <div className="card-back-qr-wrap">
                        <img src={backQrUrl} alt="vCard QR" />
                      </div>
                    ) : (
                      <div className="card-back-qr-placeholder">
                        <svg viewBox="0 0 48 48" width="70" height="70" fill="none">
                          <rect x="2" y="2" width="18" height="18" rx="3" fill="white" opacity="0.9"/>
                          <rect x="5" y="5" width="12" height="12" rx="1" fill={themeColor}/>
                          <rect x="28" y="2" width="18" height="18" rx="3" fill="white" opacity="0.7"/>
                          <rect x="31" y="5" width="12" height="12" rx="1" fill={themeColor}/>
                          <rect x="2" y="28" width="18" height="18" rx="3" fill="white" opacity="0.7"/>
                          <rect x="5" y="31" width="12" height="12" rx="1" fill={themeColor}/>
                          <rect x="28" y="28" width="6" height="6" rx="1" fill="white" opacity="0.8"/>
                          <rect x="36" y="28" width="6" height="6" rx="1" fill="white" opacity="0.6"/>
                          <rect x="28" y="36" width="6" height="6" rx="1" fill="white" opacity="0.6"/>
                        </svg>
                      </div>
                    )}

                    <p className="card-back-tagline">Scan to connect · qrcard.dev</p>
                  </div>
                )}
              </div>
            </section>

          </div>
        )}
      </main>
    </div>
  );
};

export default CardDesign;
