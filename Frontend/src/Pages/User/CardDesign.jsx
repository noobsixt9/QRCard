import Sidebar from "../../Component/User/Sidebar";
import "../../CSS/User/CardDesign.css";
const CardDesign = () => {
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

        <section className="card-design-layout">
          <aside className="customize-card">
            <h2>Customize Card</h2>

            <div className="design-control-group">
              <label>QR Type</label>

              <div className="qr-type-options">
                <button className="active">Online</button>
                <button>vCard</button>
              </div>
            </div>

            <div className="design-control-group">
              <label>Template Style</label>

              <div className="template-style-list">
                <button className="active">Minimal</button>
                <button>Professional</button>
                <button>Creative</button>
              </div>
            </div>

            <div className="design-control-group">
              <label>Color Theme</label>

              <div className="color-theme-row">
                <button className="theme-dot blue"></button>
                <button className="theme-dot purple"></button>
                <button className="theme-dot dark"></button>
                <button className="theme-dot green"></button>
              </div>
            </div>

            <div className="design-action-buttons">
              <button className="preview-card-btn">Preview Card</button>
              <button className="print-order-btn">Place Print Order</button>
            </div>
          </aside>

          <section className="live-preview-card">
            <h2>Live Preview</h2>
            <p>Front and back side preview of your visiting card.</p>

            <div className="visiting-card-front">
              <div className="card-info">
                <span className="card-brand">QR Card</span>
                <h3>Alina Khatun</h3>
                <p>Backend Developer</p>

                <div className="card-contact">
                  <span>+977 9800000000</span>
                  <span>alina@gmail.com</span>
                  <span>Kathmandu, Nepal</span>
                </div>
              </div>

              <div className="preview-qr-box">QR</div>
            </div>

            <div className="visiting-card-back">
              <h3>Scan to view my digital profile</h3>
              <p>qrcard.com/alina-khatun</p>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default CardDesign;