import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import "../CSS/LandingPage.css";

const FEATURES = [
  {
    title: "Digital Profile",
    desc: "Build a rich, interactive profile scannable from anywhere.",
    icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  },
  {
    title: "Dual QR Tech",
    desc: "Online profiles or offline vCards — you choose how to connect.",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 18h3v3h-3zM18 14h3v3h-3z" />
      </>
    ),
  },
  {
    title: "AI Bio Generator",
    desc: "Gemini-powered writing assistant for a perfect professional summary.",
    icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  },
  {
    title: "Physical Cards",
    desc: "Order high-quality printed scannable cards delivered to you.",
    icon: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
  },
];

const PLANS = [
  {
    name: "Free",
    price: "Rs. 0",
    period: "forever",
    highlight: false,
    badge: null,
    desc: "Perfect for getting started with a digital identity.",
    features: [
      "1 Digital profile page",
      "Online QR code (live profile link)",
      "Offline vCard QR code",
      "AI Bio Generator (Gemini)",
      "Public profile URL (qrcard.dev/u/you)",
      "Basic card design studio",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    price: "Rs. 199",
    period: "per month",
    highlight: true,
    badge: "Most Popular",
    desc: "For professionals who want to stand out.",
    features: [
      "Everything in Free",
      "Priority print order processing",
      "Custom accent colors & fonts",
      "Profile analytics & scan insights",
      "Multiple card design templates",
      "Email & phone support",
    ],
    cta: "Start Pro",
  },
  {
    name: "Print Pack",
    price: "Rs. 799",
    period: "one-time",
    highlight: false,
    badge: "Best Value",
    desc: "Physical cards printed and delivered to your door.",
    features: [
      "100 premium printed cards",
      "Choice of paper & finish",
      "Both QR types on card",
      "Custom design review",
      "Doorstep delivery (Nepal)",
      "Reorder at discounted rates",
    ],
    cta: "Order Cards",
  },
];

const FAQS = [
  {
    q: "What is QRCard?",
    a: "QRCard is a digital visiting card platform. You create a profile, generate a QR code, and anyone who scans it instantly sees your contact details, bio, and social links — no app required.",
  },
  {
    q: "Do I need to pay to use QRCard?",
    a: "No. The core features — digital profile, online QR, offline vCard QR, and AI bio generator — are completely free. Paid plans unlock analytics, priority printing, and premium card designs.",
  },
  {
    q: "What is the difference between Online and Offline QR?",
    a: "The Online QR links to your live web profile, so anyone with internet can scan it and see your full profile. The Offline vCard QR encodes your contact details directly into the code — it works without internet and saves the contact straight to the scanner's phone.",
  },
  {
    q: "How does the AI Bio Generator work?",
    a: "It uses Google Gemini AI. Fill in your name, job title, and company, then click Generate. The AI writes a professional bio based on your profile data. You can choose the tone — Professional, Friendly, Short, or Creative.",
  },
  {
    q: "How do printed cards work?",
    a: "You design your card in the Card Design Studio, choose your paper type and finish, then place a print order. We print and deliver high-quality visiting cards to your address in Nepal.",
  },
  {
    q: "Can I update my profile after printing cards?",
    a: "Yes. If you use the Online QR code, your printed card always shows the latest version of your profile — no reprint needed.",
  },
  {
    q: "Is my profile public?",
    a: "Your profile is public at qrcard.dev/u/yourusername by default. You control exactly what's shown — you can leave fields like email and phone empty if you prefer not to share them publicly.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (i) => setOpenFaq(prev => prev === i ? null : i);

  // If already logged in, CTAs go to the correct dashboard based on role
  const handleCta = () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/register"); return; }
    const role = localStorage.getItem("userRole") || "";
    navigate(role === "admin" || role === "ADMIN" ? "/admin-dashboard" : "/dashboard");
  };

  return (
    <div className="landing-page">
      <Header />

      <main className="landing-main">
        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot" />
              QR-Based Digital Visiting Card
            </div>

            <h1>
              Your professional identity.<br />
              <span className="hero-gradient">One scannable step ahead.</span>
            </h1>

            <p>
              Join thousands of professionals bridging the physical and digital world. Create scannable visiting cards and a live profile page in minutes.
            </p>

            <div className="hero-btns">
              <button className="btn-primary" onClick={handleCta}>Get Started Free</button>
              <button className="btn-secondary" onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}>How it works</button>
            </div>

            <div className="hero-trust-stats">
              <div className="trust-stat">
                <strong>FAST &amp; SECURE</strong>
                <span>Instant Sharing</span>
              </div>
              <div className="trust-divider" />
              <div className="trust-stat">
                <strong>AI POWERED</strong>
                <span>Profile Assistant</span>
              </div>
              <div className="trust-divider" />
              <div className="trust-stat">
                <strong>100% FREE</strong>
                <span>For basic users</span>
              </div>
            </div>
          </div>

          <div className="hero-card-sandbox">
            <div className="floating-preview-card">
              <div className="fpc-header">
                <span className="fpc-brand">QRCard</span>
                <span className="fpc-chip">LIVE PREVIEW</span>
              </div>
              <div className="fpc-card-body">
                <div className="fpc-left">
                  <div className="fpc-avatar">SK</div>
                  <div className="fpc-info">
                    <h3>Sara Kim</h3>
                    <p>Product Designer · Figma Inc.</p>
                  </div>
                  <div className="fpc-contact-list">
                    <span>✉ sara.kim@figma.com</span>
                    <span>📞 +1 (415) 820-9034</span>
                    <span>🌐 qrcard.dev/u/sarakim</span>
                  </div>
                </div>
                <div className="fpc-right">
                  <div className="fpc-qr-box">QR</div>
                  <span className="fpc-url">qrcard.dev/u/sarakim</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="why-section" id="features">
          <div className="section-title">
            <span className="section-tag">Features</span>
            <h2>Modern networking at your fingertips</h2>
            <p>We've combined the best of digital profiles and traditional visiting cards.</p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {f.icon}
                  </svg>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="pricing-section" id="pricing">
          <div className="section-title">
            <span className="section-tag">Pricing</span>
            <h2>Simple, transparent pricing</h2>
            <p>Start free. Upgrade when you need more.</p>
          </div>

          <div className="pricing-grid">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`pricing-card${plan.highlight ? " pricing-card-highlight" : ""}`}>
                {plan.badge && (
                  <div className={`pricing-badge${plan.highlight ? " pricing-badge-white" : ""}`}>
                    {plan.badge}
                  </div>
                )}
                <div className="pricing-header">
                  <h3 className="pricing-plan-name">{plan.name}</h3>
                  <div className="pricing-price">
                    <span className="pricing-amount">{plan.price}</span>
                    <span className="pricing-period">/ {plan.period}</span>
                  </div>
                  <p className="pricing-desc">{plan.desc}</p>
                </div>

                <ul className="pricing-features">
                  {plan.features.map((f, i) => (
                    <li key={i} className="pricing-feature-item">
                      <svg className="pricing-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className={`pricing-cta${plan.highlight ? " pricing-cta-white" : ""}`}
                  onClick={handleCta}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="faq-section" id="faq">
          <div className="section-title">
            <span className="section-tag">FAQ</span>
            <h2>Frequently asked questions</h2>
            <p>Everything you need to know about QRCard.</p>
          </div>

          <div className="faq-list">
            {FAQS.map((item, i) => (
              <div key={i} className={`faq-item${openFaq === i ? " faq-open" : ""}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFaq(i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </button>
                {openFaq === i && (
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="cta-inner">
            <h2>Ready to transform your network?</h2>
            <p>Create your digital profile for free and start sharing today.</p>
            <button className="btn-primary" onClick={handleCta}>Create My Free Card</button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
