import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/User/PrintingOrders.css";

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
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone, setPhone] = useState("");
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

    if (!deliveryAddress.trim() || !phone.trim()) {
      setMessage("Please enter delivery address and phone number.");
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
      notes: `Paper: ${paperType}. Address: ${deliveryAddress}. Phone: ${phone}`
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
          <div className={`admin-form-message ${messageType === "error" ? "error-message" : ""}`} style={{ marginBottom: "20px" }}>
            {message}
          </div>
        )}

        <section className="orders-layout">
          <div className="order-details-card">
            <h2>Order Details</h2>

            <form className="order-form" onSubmit={handleSubmit}>
              <div className="order-field-group">
                <label>Quantity</label>
                <div className="quantity-options">
                  {["100", "200", "500", "Custom"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={quantity === item ? "active" : ""}
                      onClick={() => setQuantity(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {quantity === "Custom" && (
                <div className="order-field-group" style={{ marginTop: "10px" }}>
                  <label>Enter Custom Quantity (Min 50)</label>
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    style={{ height: "40px", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "0 12px" }}
                  />
                </div>
              )}

              <div className="order-field-group">
                <label>Paper Type</label>
                <div className="paper-options">
                  {["Standard", "Premium", "Matte", "Glossy"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={paperType === item ? "active" : ""}
                      onClick={() => setPaperType(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="order-field-group">
                <label>Delivery Address</label>
                <textarea
                  placeholder="Enter your full delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="order-field-group phone-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="15"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="9800000000"
                  required
                />
              </div>

              <button type="submit" className="place-order-btn" disabled={submitting}>
                {submitting ? "Placing Order..." : "Confirm & Place Order"}
              </button>
            </form>
          </div>

          <aside className="order-side">
            <div className="order-summary-card">
              <h2>Order Summary</h2>

              <div className="selected-card-preview" style={{ background: designConfig?.primary_color || "#5b68e8", color: "white", padding: "20px", borderRadius: "10px", textAlign: "center", marginBottom: "20px" }}>
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                  {designConfig?.template || "Minimal"} Style
                </span>
                <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.9 }}>
                  QR Type: {qrType}
                </p>
              </div>

              <div className="summary-list">
                <p><strong>Template:</strong> {designConfig?.template || "Minimal"}</p>
                <p><strong>Quantity:</strong> {getNumericQuantity()} cards</p>
                <p><strong>Paper:</strong> {paperType}</p>
                <p><strong>Subtotal:</strong> Rs. {subtotal}</p>
                <p><strong>Delivery Charge:</strong> Rs. {delivery}</p>
              </div>

              <div className="summary-total">
                <h3>Total: Rs. {total}</h3>
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