import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import "../CSS/LandingPage.css";
import TryCardPreview from "../Component/TryCardPreview";

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="landing-page">
      <Header />

      <main className="landing-main">
        {/* HERO SECTION - SAME DESIGN */}
        <section className="hero" id="home">
          <div className="hero-content">
            <h1>Create Your Digital Visiting Card in Minutes</h1>

            <p>
              Build your digital profile, generate online or offline QR codes,
              and share your contact details easily.
            </p>

            <div className="hero-btns">
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate("/register")}
              >
                Get Started
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => scrollToSection("try-card-preview")}
              >
                View Demo
              </button>
            </div>
          </div>

          <div className="hero-image">
            <div className="card-preview">
              <div className="user-info">
                <div className="avatar">AK</div>

                <div className="user-text">
                  <h3>Alina Khatun</h3>
                  <span>Backend Developer</span>
                </div>
              </div>

              <div className="badge-stack">
                <span className="badge">Online</span>
                <span className="badge purple">vCard</span>
              </div>

              <div className="qr-box">
                <span>QR</span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION - SAME CONTENT */}
        <section className="features" id="features">
          <h2>Everything you need for smart networking</h2>

          <div className="feature-grid">
            <div className="f-card">
              <h3>Digital Profile</h3>
              <p>Create and update your personal and professional details.</p>
            </div>

            <div className="f-card">
              <h3>Online QR Code</h3>
              <p>Share your public profile link using a QR code.</p>
            </div>

            <div className="f-card">
              <h3>Offline vCard QR</h3>
              <p>Let people save your contact without internet.</p>
            </div>

            <div className="f-card">
              <h3>AI Bio Generator</h3>
              <p>Generate a professional bio and improve your profile.</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-it-works-section" id="how-it-works">
          <div className="landing-section-heading">
            <span>How It Works</span>
            <h2>Create and share your QR card in simple steps</h2>
            <p>
              Build your digital profile, generate QR codes, design your visiting
              card, and place print orders from one platform.
            </p>
          </div>

          <div className="how-steps-grid">
            <div className="how-step-card">
              <strong>01</strong>
              <h3>Create Profile</h3>
              <p>Add your name, job title, contact details, bio, and social links.</p>
            </div>

            <div className="how-step-card">
              <strong>02</strong>
              <h3>Generate QR</h3>
              <p>Choose online QR for profile sharing or offline vCard QR.</p>
            </div>

            <div className="how-step-card">
              <strong>03</strong>
              <h3>Design Card</h3>
              <p>Select a card style and attach your preferred QR code.</p>
            </div>

            <div className="how-step-card">
              <strong>04</strong>
              <h3>Print & Share</h3>
              <p>Place a printing order and share your identity professionally.</p>
            </div>
          </div>
        </section>

        {/* TEMPLATES */}
        <section className="templates-section" id="templates">
          <div className="landing-section-heading">
            <span>Templates</span>
            <h2>Choose a visiting card style</h2>
            <p>
              Preview simple card styles and use them with online QR or offline
              vCard QR.
            </p>
          </div>

          <div className="landing-template-grid">
            <div className="landing-template-card active">
              <div className="template-mini-preview minimal">
                <div>
                  <h4>Alina Khatun</h4>
                  <p>Backend Developer</p>
                </div>
                <span>QR</span>
              </div>

              <h3>Minimal</h3>
              <p>Clean and simple card layout for professional networking.</p>
            </div>

            <div className="landing-template-card">
              <div className="template-mini-preview professional">
                <div>
                  <h4>QR Card</h4>
                  <p>Professional</p>
                </div>
                <span>QR</span>
              </div>

              <h3>Professional</h3>
              <p>Best for business owners, service providers, and professionals.</p>
            </div>

            <div className="landing-template-card">
              <div className="template-mini-preview creative">
                <div>
                  <h4>Digital Card</h4>
                  <p>Creative Style</p>
                </div>
                <span>QR</span>
              </div>

              <h3>Creative</h3>
              <p>Modern style for freelancers, creators, and personal branding.</p>
            </div>
          </div>
        </section>

        <TryCardPreview />

        {/* PRICING */}
        <section className="pricing-section" id="pricing">
          <div className="landing-section-heading center">
            <span>Pricing</span>
            <h2>Simple pricing for digital and printed cards</h2>
            <p>
              Start with a digital QR profile and order printed visiting cards
              when needed.
            </p>
          </div>

          <div className="landing-pricing-grid">
            <div className="landing-pricing-card">
              <h3>Free Digital</h3>
              <h2>Rs. 0</h2>
              <p>Create your digital profile and generate online QR code.</p>

              <ul>
                <li>Digital profile</li>
                <li>Online QR code</li>
                <li>Basic card preview</li>
              </ul>

              <button type="button" onClick={() => navigate("/register")}>
                Start Free
              </button>
            </div>

            <div className="landing-pricing-card featured">
              <div className="popular-badge">Popular</div>

              <h3>Print Pack</h3>
              <h2>Rs. 900</h2>
              <p>Order printed QR visiting cards with standard paper.</p>

              <ul>
                <li>100 printed cards</li>
                <li>QR card design</li>
                <li>Delivery support</li>
              </ul>

              <button type="button" onClick={() => navigate("/register")}>
                Order Cards
              </button>
            </div>

            <div className="landing-pricing-card">
              <h3>Premium</h3>
              <h2>Custom</h2>
              <p>For custom design, bulk orders, and business support.</p>

              <ul>
                <li>Custom card design</li>
                <li>Bulk printing</li>
                <li>Vendor support</li>
              </ul>

              <button type="button" onClick={() => scrollToSection("contact")}>
                Contact Us
              </button>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="landing-contact-section" id="contact">
          <div>
            <span>Get Started</span>
            <h2>Ready to create your smart QR visiting card?</h2>
            <p>
              Create your digital profile, generate QR codes, and share your
              identity with one scan.
            </p>
          </div>

          <button type="button" onClick={() => navigate("/register")}>
            Create Your Card
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;