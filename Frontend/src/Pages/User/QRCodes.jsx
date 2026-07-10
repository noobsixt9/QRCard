import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import { API_URL, getHeaders } from "../../config/api";
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

  useEffect(() => {
    // 1. Get logged in user details
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    // 2. Fetch user QR codes
    const fetchQRCodes = async () => {
      try {
        const response = await fetch(`${API_URL}/qr`, {
          method: "GET",
          headers: getHeaders(null),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to load QR codes");
        }

        setQrCodes(result.data);
        // Default to OFFLINE if only offline exists, otherwise default to ONLINE
        if (!result.data.online && result.data.offline) {
          setSelectedType("OFFLINE");
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
      alert("Offline QR contains vCard contact card information for scanning directly via a phone camera to add to contacts.");
    }
  };

  const activeQR = selectedType === "ONLINE" ? qrCodes?.online : qrCodes?.offline;
  const username = user?.username || "user";
  const fullName = user?.username ? user.username.replace(/_/g, " ") : "Your Name";

  return (
    <div className="qr-page">
      <Sidebar />

      <main className="qr-main">
        <div className="qr-header">
          <h1>QR Code Generation</h1>
          <p>
            Generate online QR for your public profile or offline vCard QR for
            saving contact without internet.
          </p>
        </div>

        {error && <div className="qr-message error-message">{error}</div>}
        {success && <div className="qr-message success-message">{success}</div>}

        <section className="qr-option-grid">
          <div className={`qr-option-card ${selectedType === "ONLINE" ? "active" : ""}`}>
            <div className="qr-option-icon">🌐</div>
            <h2>Online QR Code</h2>
            <p>
              Redirects people to your public digital profile page with updated
              contact details and social links.
            </p>
            <button 
              type="button"
              disabled={generating}
              onClick={() => generateQR("ONLINE")}
            >
              {qrCodes?.online ? "Regenerate Online QR" : "Generate Online QR"}
            </button>
          </div>

          <div className={`qr-option-card ${selectedType === "OFFLINE" ? "active" : ""}`}>
            <div className="qr-option-icon">🗂️</div>
            <h2>Offline QR Code</h2>
            <p>
              Stores contact details in vCard format so receivers can save your
              contact even without internet.
            </p>
            <button 
              type="button"
              disabled={generating}
              onClick={() => generateQR("OFFLINE")}
            >
              {qrCodes?.offline ? "Regenerate vCard QR" : "Generate vCard QR"}
            </button>
          </div>
        </section>

        <section className="qr-preview-section">
          <h2>Generated QR Preview</h2>

          <div className="qr-preview-card">
            <div className="qr-preview-box">
              {loading ? (
                <span>Loading...</span>
              ) : activeQR?.qr_data_url ? (
                <img 
                  src={activeQR.qr_data_url} 
                  alt={`${selectedType} QR Code`} 
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <span>No QR Generated</span>
              )}
            </div>

            <div className="qr-preview-info">
              <h3>
                {fullName.replace(/\b\w/g, c => c.toUpperCase())}'s {selectedType === "ONLINE" ? "Online" : "vCard"} QR
              </h3>
              <p>{selectedType === "ONLINE" ? "Online Public Profile" : "Offline Contact Card"}</p>
              <p>
                {selectedType === "ONLINE" 
                  ? `Link: ${window.location.host}/u/${username}` 
                  : "Contains offline vCard payload"}
              </p>
              <p>
                Status: {activeQR ? `Generated on ${new Date(activeQR.created_at).toLocaleDateString()}` : "Not Generated Yet"}
              </p>

              {activeQR?.scan_count !== undefined && (
                <p>Scans/Views: {activeQR.scan_count}</p>
              )}

              <div className="qr-preview-actions">
                <button 
                  type="button"
                  className="primary-btn" 
                  disabled={!activeQR}
                  onClick={() => downloadQR(selectedType)}
                >
                  Download PNG
                </button>
                <button 
                  type="button"
                  className="outline-btn"
                  disabled={!activeQR}
                  onClick={() => handleTestQR(selectedType)}
                >
                  {selectedType === "ONLINE" ? "Test / Open Link" : "View Info"}
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