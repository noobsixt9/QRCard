import { useState } from "react";
import Sidebar from "../../Component/User/Sidebar";
import "../../CSS/User/PrintingOrders.css";

const PrintingOrders = () => {
  const [quantity, setQuantity] = useState("100");
  const [paperType, setPaperType] = useState("Standard");
  const [phone, setPhone] = useState("");

  const handlePhoneChange = (e) => {
    const numbersOnly = e.target.value.replace(/\D/g, "");
    setPhone(numbersOnly);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log({
      quantity,
      paperType,
      phone,
    });
  };

  return (
    <div className="orders-page">
      <Sidebar />

      <main className="orders-main">
        <div className="orders-header">
          <h1>Printing Order</h1>
          <p>Place an order to print your customized QR visiting card.</p>
        </div>

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
                <textarea placeholder="Enter your full delivery address"></textarea>
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
                />
              </div>

              <button type="submit" className="place-order-btn">
                Place Order
              </button>
            </form>
          </div>

          <aside className="order-side">
            <div className="order-summary-card">
              <h2>Order Summary</h2>

              <div className="selected-card-preview">
                <span>Selected Card Preview</span>
              </div>

              <div className="summary-list">
                <p><strong>Template:</strong> Minimal</p>
                <p><strong>Quantity:</strong> {quantity} cards</p>
                <p><strong>Paper:</strong> {paperType}</p>
                <p><strong>Estimated Price:</strong> Rs. 800</p>
                <p><strong>Delivery Charge:</strong> Rs. 100</p>
              </div>

              <div className="summary-total">
                <h3>Total: Rs. 900</h3>
              </div>
            </div>

            <div className="order-note-card">
              <h3>Note</h3>
              <p>
                Online payment and delivery tracking can be added in the future
                version. For now, this module supports basic order placement.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default PrintingOrders;