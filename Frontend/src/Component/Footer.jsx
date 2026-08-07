import React from "react";
import "../CSS/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>QR Card</h2>
          <p>
            Create digital profiles, generate QR codes, and share your contact
            information smartly.
          </p>
        </div>

        <div className="footer-column">
          <h3>Product</h3>
          <a href="/#features">Features</a>
          <a href="/#templates">Templates</a>
          <a href="/#pricing">Pricing</a>
        </div>

        <div className="footer-column">
          <h3>Account</h3>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
          <a href="/#contact">Contact</a>
        </div>

        <div className="footer-column footer-contact">
          <h3>Contact</h3>

          <a href="mailto:hello@qrcard.com" className="contact-row">
            <i className="bi bi-envelope-fill"></i>
            <span>hello@qrcard.com</span>
          </a>

          <a href="tel:+9779800000000" className="contact-row">
            <i className="bi bi-telephone-fill"></i>
            <span>+977 9800000000</span>
          </a>

          <div className="contact-row">
            <i className="bi bi-geo-alt-fill"></i>
            <span>Kathmandu, Nepal</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 QR Card. All rights reserved.</p>

        <div className="footer-social-icons">
          <a href="/#contact" aria-label="Facebook">
            <i className="bi bi-facebook"></i>
          </a>

          <a href="/#contact" aria-label="Instagram">
            <i className="bi bi-instagram"></i>
          </a>

          <a href="/#contact" aria-label="LinkedIn">
            <i className="bi bi-linkedin"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;