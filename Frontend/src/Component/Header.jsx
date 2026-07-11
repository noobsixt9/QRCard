import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/qr-card-logo.png";
import "../CSS/Header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="site-header">
      {/* Dark backdrop overlay when menu is open */}
      {isMenuOpen && <div className="menu-backdrop" onClick={closeMenu}></div>}

      <a href="/#home" className="logo-container" onClick={closeMenu}>
        <img src={logo} alt="QR Card" className="logo-img" />
      </a>

      {/* Navigation menu (slide-out side drawer) */}
      <nav className={`site-nav ${isMenuOpen ? "active" : ""}`}>
        {/* Mobile Drawer Header (Logo on Left, Elegant close cross on Right) */}
        <div className="drawer-header">
          <a href="/#home" className="logo-container" onClick={closeMenu}>
            <img src={logo} alt="QR Card" className="logo-img drawer-logo" />
          </a>
          <button className="drawer-close-btn" onClick={closeMenu} aria-label="Close Menu">
            <span className="close-line"></span>
            <span className="close-line"></span>
          </button>
        </div>

        <ul className="site-nav-list">
          <li><a href="/#home" onClick={closeMenu}>Home</a></li>
          <li><a href="/#features" onClick={closeMenu}>Features</a></li>
          <li><a href="/#templates" onClick={closeMenu}>Templates</a></li>
          <li><a href="/#pricing" onClick={closeMenu}>Pricing</a></li>
          <li><a href="/#contact" onClick={closeMenu}>Contact</a></li>
          <li className="mobile-only-login">
            <NavLink to="/login" className="header-login-link" onClick={closeMenu}>
              Login
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="header-actions">
        <NavLink to="/login" className="header-login-link desktop-only-login">
          Login
        </NavLink>

        <NavLink to="/register" className="btn-nav-get-started">
          Get Started
        </NavLink>

        {/* Minimalist 2-line thin hamburger icon */}
        <button 
          className="hamburger-btn" 
          onClick={toggleMenu}
          aria-label="Toggle Navigation"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;