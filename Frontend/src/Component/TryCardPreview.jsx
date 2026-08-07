import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/TryCardPreview.css";

const TryCardPreview = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "Alina Khatun",
    role: "Backend Developer",
    email: "alina@example.com",
    phone: "9800000000",
    website: "qrcard.com/alina",
    address: "Kathmandu, Nepal",
  });

  const [template, setTemplate] = useState("minimal");
  const [theme, setTheme] = useState("blue");
  const [spacing, setSpacing] = useState("normal");
  const [qrType, setQrType] = useState("online");
  const [notice, setNotice] = useState("");

  const initials = useMemo(() => {
    const words = formData.fullName.trim().split(" ").filter(Boolean);

    if (words.length === 0) return "QR";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }, [formData.fullName]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;

    if (name === "fullName") {
      updatedValue = value.replace(/[^a-zA-Z\s.'-]/g, "");
    }

    if (name === "phone") {
      updatedValue = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    setNotice("");
  };

  const saveDraftAndRedirect = (actionType) => {
    const draftData = {
      formData,
      design: {
        template,
        theme,
        spacing,
        qrType,
      },
      actionType,
    };

    localStorage.setItem("cardPreviewDraft", JSON.stringify(draftData));

    if (actionType === "order") {
      localStorage.setItem("afterLoginRedirect", "/printing-order");
    } else {
      localStorage.setItem("afterLoginRedirect", "/card-design");
    }

    localStorage.setItem("pendingPreviewAction", actionType);

    setNotice("Please login to save your card and continue.");

    setTimeout(() => {
      navigate("/login");
    }, 700);
  };

  return (
    <section className="try-preview-section" id="try-card-preview">
      <div className="try-preview-heading">
        <span>Live Preview</span>
        <h2>Preview your QR visiting card instantly</h2>
        <p>
          Fill your details, choose a template, adjust the style, and see how
          your digital visiting card will look before creating an account.
        </p>
      </div>

      <div className="try-preview-layout">
        <div className="try-preview-panel">
          <div className="preview-form-header">
            <h3>Card Information</h3>
            <p>No account needed for preview.</p>
          </div>

          <div className="preview-form-grid">
            <div className="preview-input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
              />
            </div>

            <div className="preview-input-group">
              <label>Role / Job Title</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Enter job title"
              />
            </div>

            <div className="preview-input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
              />
            </div>

            <div className="preview-input-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                maxLength="15"
              />
            </div>

            <div className="preview-input-group">
              <label>Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="Enter website"
              />
            </div>

            <div className="preview-input-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </div>
          </div>

          <div className="preview-control-block">
            <label>Template Style</label>

            <div className="preview-option-row">
              {["minimal", "professional", "creative"].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={template === item ? "active" : ""}
                  onClick={() => setTemplate(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="preview-control-block">
            <label>Theme Color</label>

            <div className="color-option-row">
              {["blue", "purple", "green", "dark"].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`color-dot ${item} ${
                    theme === item ? "active" : ""
                  }`}
                  onClick={() => setTheme(item)}
                  aria-label={item}
                ></button>
              ))}
            </div>
          </div>

          <div className="preview-control-grid">
            <div className="preview-control-block">
              <label>Card Spacing</label>

              <div className="preview-option-row small">
                {["compact", "normal", "wide"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={spacing === item ? "active" : ""}
                    onClick={() => setSpacing(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="preview-control-block">
              <label>QR Type</label>

              <div className="preview-option-row small">
                <button
                  type="button"
                  className={qrType === "online" ? "active" : ""}
                  onClick={() => setQrType("online")}
                >
                  Online
                </button>

                <button
                  type="button"
                  className={qrType === "vcard" ? "active" : ""}
                  onClick={() => setQrType("vcard")}
                >
                  vCard
                </button>
              </div>
            </div>
          </div>

          {notice && <p className="preview-notice">{notice}</p>}
        </div>

        <div className="try-preview-display">
          <div className="preview-display-header">
            <h3>Live Preview</h3>
            <p>Changes apply instantly.</p>
          </div>

          <div
            className={`live-card-preview template-${template} theme-${theme} spacing-${spacing}`}
          >
            <div className="live-card-top">
              <div className="live-avatar">{initials}</div>

              <div>
                <h3>{formData.fullName || "Your Name"}</h3>
                <p>{formData.role || "Your Role"}</p>
              </div>
            </div>

            <div className="live-card-body">
              <div className="live-info-list">
                <span>
                  <i className="bi bi-envelope-fill"></i>
                  {formData.email || "email@example.com"}
                </span>

                <span>
                  <i className="bi bi-telephone-fill"></i>
                  {formData.phone || "9800000000"}
                </span>

                <span>
                  <i className="bi bi-globe2"></i>
                  {formData.website || "yourwebsite.com"}
                </span>

                <span>
                  <i className="bi bi-geo-alt-fill"></i>
                  {formData.address || "Your Address"}
                </span>
              </div>

              <div className="live-qr-box">
                <strong>QR</strong>
                <small>{qrType === "online" ? "Online" : "vCard"}</small>
              </div>
            </div>
          </div>

          <div className="preview-action-buttons">
            <button type="button" onClick={() => saveDraftAndRedirect("save")}>
              Save Design
            </button>

            <button
              type="button"
              onClick={() => saveDraftAndRedirect("download")}
            >
              Download Card
            </button>

            <button
              type="button"
              className="order-btn"
              onClick={() => saveDraftAndRedirect("order")}
            >
              Order Printed Card
            </button>
          </div>

          <p className="preview-helper-text">
            Preview is free. Login is required only for saving, downloading, or
            ordering.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TryCardPreview;