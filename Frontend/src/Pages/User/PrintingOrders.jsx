import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/User/PrintingOrders.css";

const CodIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

const EsewaIcon = () => (
  <svg viewBox="0 0 40 40" width="32" height="32">
    <rect width="40" height="40" rx="8" fill="#60BB46"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="800" fontFamily="Arial,sans-serif">eSewa</text>
  </svg>
);

const KhaltiIcon = () => (
  <svg viewBox="0 0 40 40" width="32" height="32">
    <rect width="40" height="40" rx="8" fill="#5C2D91"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="800" fontFamily="Arial,sans-serif">Khalti</text>
  </svg>
);

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", Icon: CodIcon },
  { id: "esewa", label: "eSewa", Icon: EsewaIcon },
  { id: "khalti", label: "Khalti", Icon: KhaltiIcon },
];

const PrintingOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Load design config passed from navigation state or localStorage
  const [designConfig] = useState(() => {
    if (location.state && location.state.design) {
      return location.state.design;
    }
    const savedDesign = localStorage.getItem("qrCardActiveDesign");
    if (savedDesign) {
      try {
        const parsed = JSON.parse(savedDesign);
        return parsed.design || null;
      } catch (e) {
        console.error("Failed to parse saved design:", e);
      }
    }
    return null;
  });

  const [qrType] = useState(() => {
    if (location.state && location.state.qrType) {
      return location.state.qrType;
    }
    const savedDesign = localStorage.getItem("qrCardActiveDesign");
    if (savedDesign) {
      try {
        const parsed = JSON.parse(savedDesign);
        return parsed.qrType || "ONLINE";
      } catch (e) {
        console.error("Failed to parse saved design:", e);
      }
    }
    return "ONLINE";
  });

  const [quantity, setQuantity] = useState("100");
  const [customQty, setCustomQty] = useState("150");
  const [paperType, setPaperType] = useState("Standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [fullName, setFullName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handlePhoneChange = (e) => {
    const numbersOnly = e.target.value.replace(/\D/g, "");
    setPhone(numbersOnly);
  };

  const getNumericQuantity = () => {
    if (quantity === "Custom") {
      return Math.max(50, parseInt(customQty) || 50);
    }
    return parseInt(quantity);
  };

  // Pricing calculations
  const calculatePrice = () => {
    const qty = getNumericQuantity();
    let pricePerCard = 8;
    
    if (qty >= 500) {
      pricePerCard = 7; // Bulk discount
    } else if (qty >= 200) {
      pricePerCard = 7.5;
    }

    const cardsPrice = qty * pricePerCard;
    const delivery = 100;
    
    return {
      subtotal: cardsPrice,
      delivery,
      total: cardsPrice + delivery
    };
  };

  const { subtotal, delivery, total } = calculatePrice();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !deliveryAddress.trim() || !phone.trim()) {
      setMessage("Please fill in your name, delivery address, and phone number.");
      setMessageType("error");
      return;
    }

    const qtyVal = getNumericQuantity();

    // Prepare payload matching the backend schema
    const payload = {
      design_config: {
        template: designConfig?.template || "Minimal",
        primary_color: designConfig?.primary_color || "#5b68e8",
        secondary_color: designConfig?.secondary_color || "#ffffff",
        show_avatar: designConfig?.show_avatar !== undefined ? designConfig.show_avatar : true,
        font: designConfig?.font || "inter"
      },
      qr_type: qrType,
      quantity: qtyVal,
      notes: `Name: ${fullName}. Paper: ${paperType}. Address: ${deliveryAddress}. Phone: ${phone}. Notes: ${orderNotes || "None"}`
    };

    try {
      setSubmitting(true);
      setMessage("");

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to place print order.");
      }

      setMessage("Order placed successfully! Redirecting to orders tracking...");
      setMessageType("success");

      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } catch (err) {
      console.error("Place order error:", err.message);
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="orders-page">
      <Sidebar />

      <main className="orders-main">
        <div className="orders-header">
          <h1>Printing Order</h1>
          <p>Place an order to print your customized QR visiting card.</p>
        </div>

        {message && (
          <div className={`order-message ${messageType === "error" ? "error" : "success"}`}>
            {message}
          </div>
        )}

        <section className="orders-layout">
          <div className="order-details-card">
            <h2>Order Details</h2>

            <form className="order-form" onSubmit={handleSubmit}>

              {/* ── Section: Quantity & Paper ── */}
              <div className="order-form-section">
                <div className="order-section-title">Card Options</div>

                <div className="order-field-group">
                  <label>Quantity</label>
                  <div className="quantity-options">
                    {["100", "200", "500", "Custom"].map((item) => (
                      <button key={item} type="button"
                        className={quantity === item ? "active" : ""}
                        onClick={() => setQuantity(item)}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {quantity === "Custom" && (
                  <div className="order-field-group custom-qty-field">
                    <label>Custom Quantity <span className="field-note">(min 50)</span></label>
                    <input type="number" min="50" max="2000"
                      value={customQty}
                      onChange={(e) => setCustomQty(e.target.value)}
                      placeholder="e.g. 150" />
                  </div>
                )}

                <div className="order-field-group">
                  <label>Paper Type</label>
                  <div className="paper-options">
                    {["Standard", "Premium", "Matte", "Glossy"].map((item) => (
                      <button key={item} type="button"
                        className={paperType === item ? "active" : ""}
                        onClick={() => setPaperType(item)}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Section: Delivery Info ── */}
              <div className="order-form-section">
                <div className="order-section-title">Delivery Information</div>

                <div className="order-fields-row">
                  <div className="order-field-group">
                    <label>Full Name <span className="field-required">*</span></label>
                    <input type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Rajan Kshedal"
                      required />
                  </div>

                  <div className="order-field-group">
                    <label>Phone Number <span className="field-required">*</span></label>
                    <input type="tel" inputMode="numeric" pattern="[0-9]*" maxLength="15"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="9800000000"
                      required />
                  </div>
                </div>

                <div className="order-field-group">
                  <label>Delivery Address <span className="field-required">*</span></label>
                  <textarea
                    placeholder="Enter your full delivery address (street, city, district)"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required />
                </div>

                <div className="order-field-group">
                  <label>Order Notes <span className="field-note">(optional)</span></label>
                  <textarea className="notes-textarea"
                    placeholder="Any special instructions or notes for your order..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)} />
                </div>
              </div>

              {/* ── Section: Payment ── */}
              <div className="order-form-section">
                <div className="order-section-title">Payment Method</div>
                <div className="payment-method-options">
                  {PAYMENT_METHODS.map((pm) => (
                    <button key={pm.id} type="button"
                      className={`payment-method-btn${paymentMethod === pm.id ? " active" : ""}`}
                      onClick={() => setPaymentMethod(pm.id)}>
                      <span className="payment-icon"><pm.Icon /></span>
                      <span className="payment-label">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="place-order-btn" disabled={submitting}>
                {submitting ? "Placing Order…" : "Confirm & Place Order"}
              </button>
            </form>
          </div>

          <aside className="order-side">
            <div className="order-summary-card">
              <h2>Order Summary</h2>

              {/* Mini card design preview */}
              <div className="summary-card-preview">
                <div className="scp-stripe" style={{ background: designConfig?.theme_color || "var(--accent)" }} />
                <div className="scp-body">
                  <div className="scp-left">
                    <span className="scp-brand" style={{ color: designConfig?.theme_color || "var(--accent)" }}>QR CARD</span>
                    <span className="scp-name">{designConfig?.profile_name || "Your Name"}</span>
                    <span className="scp-role">{designConfig?.profile_title || "Job Title"}</span>
                  </div>
                  <div className="scp-qr">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
                      <rect x="2" y="2" width="9" height="9" rx="1" fill={designConfig?.theme_color || "var(--accent)"} opacity="0.6"/>
                      <rect x="13" y="2" width="9" height="9" rx="1" fill={designConfig?.theme_color || "var(--accent)"} opacity="0.4"/>
                      <rect x="2" y="13" width="9" height="9" rx="1" fill={designConfig?.theme_color || "var(--accent)"} opacity="0.4"/>
                      <rect x="14" y="14" width="3" height="3" fill={designConfig?.theme_color || "var(--accent)"} opacity="0.8"/>
                      <rect x="19" y="14" width="3" height="3" fill={designConfig?.theme_color || "var(--accent)"} opacity="0.6"/>
                      <rect x="14" y="19" width="3" height="3" fill={designConfig?.theme_color || "var(--accent)"} opacity="0.6"/>
                    </svg>
                  </div>
                </div>
                <div className="scp-type-badge">
                  {designConfig?.card_qr_type || qrType} · {designConfig?.layout || "Standard"}
                </div>
              </div>

              <div className="summary-list">
                <div className="summary-row"><span>Template</span><strong>{designConfig?.template || "Minimal"}</strong></div>
                <div className="summary-row"><span>Quantity</span><strong>{getNumericQuantity()} cards</strong></div>
                <div className="summary-row"><span>Paper</span><strong>{paperType}</strong></div>
                <div className="summary-row"><span>Subtotal</span><strong>Rs. {subtotal}</strong></div>
                <div className="summary-row"><span>Delivery</span><strong>Rs. {delivery}</strong></div>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>Rs. {total}</span>
              </div>
            </div>

            <div className="order-note-card">
              <h3>Secure Checkout</h3>
              <p>
                Your card design is automatically attached to this printing request. Payment is Cash on Delivery (COD) at your doorstep.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default PrintingOrders;