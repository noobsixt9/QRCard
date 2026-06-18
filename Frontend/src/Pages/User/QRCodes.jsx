import Sidebar from "../../Component/User/Sidebar";
import "../../CSS/User/QRCodes.css";

const QRCodes = () => {
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

        <section className="qr-option-grid">
          <div className="qr-option-card">
            <div className="qr-option-icon">🌐</div>

            <h2>Online QR Code</h2>
            <p>
              Redirects people to your public digital profile page with updated
              contact details and social links.
            </p>

            <button>Generate Online QR</button>
          </div>

          <div className="qr-option-card">
            <div className="qr-option-icon">🗂️</div>

            <h2>Offline QR Code</h2>
            <p>
              Stores contact details in vCard format so receivers can save your
              contact even without internet.
            </p>

            <button>Generate vCard QR</button>
          </div>
        </section>

        <section className="qr-preview-section">
          <h2>Generated QR Preview</h2>

          <div className="qr-preview-card">
            <div className="qr-preview-box">
              <span>QR</span>
            </div>

            <div className="qr-preview-info">
              <h3>Alina Khatun’s QR Code</h3>
              <p>Online Public Profile</p>
              <p>Link: qrcard.com/alinakhatun</p>
              <p>Created: Today</p>

              <div className="qr-preview-actions">
                <button className="primary-btn">Download PNG</button>
                <button className="outline-btn">Download SVG</button>
                <button className="outline-btn">Test QR</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default QRCodes;