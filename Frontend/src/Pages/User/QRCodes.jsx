import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import { API_URL, getHeaders } from "../../config/api";
import { cachedFetch, invalidate, CACHE } from "../../utils/cache";
import "../../CSS/User/QRCodes.css";

const QRCodes = () => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [qrCodes, setQrCodes] = useState({ online: null, offline: null });
  const [selectedType, setSelectedType] = useState("ONLINE");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const fetchQRCodes = async () => {
      try {
        const data = await cachedFetch(CACHE.QR, `${API_URL}/qr`, { headers: getHeaders(null) });
        if (data) {
          setQrCodes(data);
          if (!data.online && data.offline) setSelectedType("OFFLINE");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, [navigate]);

  const generateQR = async (type) => {
    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = `${API_URL}/qr/${type.toLowerCase()}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: getHeaders(null),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Failed to generate ${type} QR Code`);
      }

      invalidate(CACHE.QR); // bust cache so dashboard re-fetches scan count
      setQrCodes((prev) => ({
        ...prev,
        [type.toLowerCase()]: result.data,
      }));
      setSelectedType(type);
      setSuccess(`${type} QR Code generated successfully!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadQR = (type) => {
    const qr = type === "ONLINE" ? qrCodes?.online : qrCodes?.offline;
    if (!qr?.qr_data_url) return;
    const link = document.createElement("a");
    link.href = qr.qr_data_url;
    link.download = `qrcard_${type.toLowerCase()}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTestQR = (type) => {
    if (type === "ONLINE" && user?.username) {
      const publicUrl = `${window.location.origin}/u/${user.username}`;
      window.open(publicUrl, "_blank");
    } else if (type === "OFFLINE") {
      alert(
        "Offline QR contains vCard contact card information for scanning directly via a phone camera to add to contacts."
      );
    }
  };

  const handleCopyLink = () => {
    if (!user?.username) return;
    const profileUrl = `${window.location.origin}/u/${user.username}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const activeQR = selectedType === "ONLINE" ? qrCodes?.online : qrCodes?.offline;
  const username = user?.username || "user";

  return (
    <div className="qr-page">
      <Sidebar />

      <main className="qr-main">
        {/* Header Banner */}
        <div className="qr-header-banner">
          <div className="qr-header-text">
            <h1>QR Code Studio</h1>
            <p>
              Generate an online QR for your public profile or an offline vCard
              QR for saving contact details without internet.
            </p>
          </div>
          <div className="qr-header-actions">
            <button
              type="button"
              className="copy-link-btn"
              onClick={handleCopyLink}
            >
              {copied ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
              {copied ? "Copied!" : "Copy Profile Link"}
            </button>
          </div>
        </div>

        {error && (
          <div className="qr-message error-message">{error}</div>
        )}
        {success && (
          <div className="qr-message success-message">{success}</div>
        )}

        {/* Option Cards */}
        <div className="qr-option-grid">
          {/* Online QR Card */}
          <div
            className={`qr-option-card${selectedType === "ONLINE" ? " active" : ""}`}
            onClick={() => setSelectedType("ONLINE")}
          >
            <div className="qr-option-header">
              <span className="badge-pill">Web Connected</span>
            </div>
            <div className="qr-option-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h2>Online QR Code</h2>
            <p>
              Redirects people to your public digital profile page with updated
              contact details and social links.
            </p>
            <button
              type="button"
              className="gen-btn"
              disabled={generating}
              onClick={(e) => {
                e.stopPropagation();
                generateQR("ONLINE");
              }}
            >
              {generating && selectedType === "ONLINE"
                ? "Generating..."
                : qrCodes?.online
                ? "Regenerate Online QR"
                : "Generate Online QR"}
            </button>
          </div>

          {/* Offline vCard Card */}
          <div
            className={`qr-option-card${selectedType === "OFFLINE" ? " active" : ""}`}
            onClick={() => setSelectedType("OFFLINE")}
          >
            <div className="qr-option-header">
              <span className="badge-pill offline">No Internet Needed</span>
            </div>
            <div className="qr-option-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h2>Offline vCard QR Code</h2>
            <p>
              Stores contact details in vCard format so receivers can save your
              contact even without internet.
            </p>
            <button
              type="button"
              className="gen-btn"
              disabled={generating}
              onClick={(e) => {
                e.stopPropagation();
                generateQR("OFFLINE");
              }}
            >
              {generating && selectedType === "OFFLINE"
                ? "Generating..."
                : qrCodes?.offline
                ? "Regenerate vCard QR"
                : "Generate vCard QR"}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <section className="qr-preview-section">
          <h2>Active QR Preview ({selectedType})</h2>

          <div className="qr-preview-card">
            {/* QR Image */}
            <div className="qr-preview-box">
              {loading ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="3" height="3" rx="0.5" />
                  <rect x="18" y="14" width="3" height="3" rx="0.5" />
                  <rect x="14" y="18" width="3" height="3" rx="0.5" />
                  <rect x="18" y="18" width="3" height="3" rx="0.5" />
                </svg>
              ) : activeQR?.qr_data_url ? (
                <img
                  className="qr-img"
                  src={activeQR.qr_data_url}
                  alt={`${selectedType} QR Code`}
                />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="3" height="3" rx="0.5" />
                  <rect x="18" y="14" width="3" height="3" rx="0.5" />
                  <rect x="14" y="18" width="3" height="3" rx="0.5" />
                  <rect x="18" y="18" width="3" height="3" rx="0.5" />
                </svg>
              )}
            </div>

            {/* Info Panel */}
            <div className="qr-preview-info">
              <h3>{username}</h3>
              <p className="qr-type-badge">
                {selectedType === "ONLINE"
                  ? "Live Public Web Profile"
                  : "Offline vCard Contact"}
              </p>

              <div className="qr-metadata-grid">
                <div className="meta-item">
                  <span>
                    {selectedType === "ONLINE" ? "PUBLIC ENDPOINT / LINK" : "PAYLOAD TYPE"}
                  </span>
                  <span>
                    {selectedType === "ONLINE"
                      ? `${window.location.origin}/u/${username}`
                      : "vCard 3.0 Payload"}
                  </span>
                </div>
                <div className="meta-item">
                  <span>CREATION DATE</span>
                  <span>
                    {activeQR?.created_at
                      ? new Date(activeQR.created_at).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" }
                        )
                      : "—"}
                  </span>
                </div>
                {selectedType === "ONLINE" && (
                  <div className="meta-item">
                    <span>TOTAL SCANS / VIEWS</span>
                    <span>
                      {activeQR?.scan_count !== undefined
                        ? activeQR.scan_count
                        : "—"}
                    </span>
                  </div>
                )}
              </div>

              <div className="qr-preview-actions">
                <button
                  type="button"
                  className="primary-btn"
                  disabled={!activeQR}
                  onClick={() => downloadQR(selectedType)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download PNG
                </button>
                <button
                  type="button"
                  className="outline-btn"
                  disabled={!activeQR}
                  onClick={() => handleTestQR(selectedType)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Test Live Link
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default QRCodes;
