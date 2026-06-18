import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/qr-card-logo.png";
import "../CSS/Header.css";

const Header = () => {
  return (
    <header className="site-header">
      <a href="/#home" className="logo-container">
        <img src={logo} alt="QR Card" className="logo-img" />
      </a>

      <nav className="site-nav">
        <ul className="site-nav-list">
          <li><a href="/#home">Home</a></li>
          <li><a href="/#features">Features</a></li>
          <li><a href="/#templates">Templates</a></li>
          <li><a href="/#pricing">Pricing</a></li>
          <li><a href="/#contact">Contact</a></li>
        </ul>
      </nav>

      <div className="header-actions">
        <NavLink to="/login" className="header-login-link">
          Login
        </NavLink>

        <NavLink to="/register" className="btn-nav-get-started">
          Get Started
        </NavLink>
      </div>
    </header>
  );
};

export default Header;