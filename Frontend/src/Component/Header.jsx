import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/qr-card-logo.png";
import "../CSS/Header.css";

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round" width="17" height="17">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme]           = useState(() => localStorage.getItem("theme") || "light");
  const [loggedIn, setLoggedIn]     = useState(false);
  const [username, setUsername]     = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Check session — runs on mount and on cross-tab storage changes
  const syncAuth = () => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        setUsername(u.username || "");
      } catch { setUsername(""); }
    } else {
      setLoggedIn(false);
      setUsername("");
    }
  };

  useEffect(() => {
    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  const toggleMenu = () => setIsMenuOpen(v => !v);
  const closeMenu  = () => setIsMenuOpen(false);

  const handleLogoClick = (e) => {
    closeMenu();
    if (window.location.pathname === "/" || window.location.pathname === "") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoToDashboard = (e) => {
    e.preventDefault();
    closeMenu();
    // Admin users go to their own dashboard
    const role = localStorage.getItem("userRole") || "";
    navigate(role === "admin" || role === "ADMIN" ? "/admin-dashboard" : "/dashboard");
  };

  return (
    <header className="site-header">
      {isMenuOpen && <div className="menu-backdrop" onClick={closeMenu} />}

      <a href="/" className="logo-container" onClick={handleLogoClick}>
        <img src={logo} alt="QR Card" className="logo-img" />
      </a>

      <nav className={`site-nav ${isMenuOpen ? "active" : ""}`}>
        <div className="drawer-header">
          <a href="/" className="logo-container" onClick={handleLogoClick}>
            <img src={logo} alt="QR Card" className="logo-img drawer-logo" />
          </a>
          <button className="drawer-close-btn" onClick={closeMenu} aria-label="Close Menu">
            <span className="close-line" /><span className="close-line" />
          </button>
        </div>

        <ul className="site-nav-list">
          <li><a href="/"          onClick={closeMenu}>Home</a></li>
          <li><a href="/#features" onClick={closeMenu}>Features</a></li>
          <li><a href="/#pricing"  onClick={closeMenu}>Pricing</a></li>
          <li><a href="/#faq"      onClick={closeMenu}>FAQ</a></li>
          {/* Mobile: show Dashboard if logged in, otherwise Login */}
          <li className="mobile-only-login">
            {loggedIn ? (
              <a href="/dashboard" onClick={handleGoToDashboard}>Dashboard</a>
            ) : (
              <NavLink to="/login" className="header-login-link" onClick={closeMenu}>Login</NavLink>
            )}
          </li>
        </ul>
      </nav>

      <div className="header-actions">
        <button
          className="header-theme-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>

        {loggedIn ? (
          /* Logged-in state: show user chip → Dashboard */
          <a
            href="/dashboard"
            className="header-user-chip desktop-only-login"
            onClick={handleGoToDashboard}
          >
            <div className="header-user-avatar">
              {username.slice(0, 1).toUpperCase() || "U"}
            </div>
            <span className="header-user-name">{username}</span>
          </a>
        ) : (
          /* Logged-out state */
          <>
            <NavLink to="/login" className="header-login-link desktop-only-login">Login</NavLink>
            <NavLink to="/register" className="btn-nav-get-started">Get Started</NavLink>
          </>
        )}

        <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle Navigation">
          <span className="hamburger-line" /><span className="hamburger-line" />
        </button>
      </div>
    </header>
  );
};

export default Header;
