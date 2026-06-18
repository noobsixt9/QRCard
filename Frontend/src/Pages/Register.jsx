import React from 'react';
import Header from '../Component/Header';
import { NavLink } from 'react-router-dom';
import '../CSS/Register.css';

const Register = () => {
  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="auth-container">
        {/* LEFT SIDE: BLUE BRAND CARD */}
        <section className="auth-sidebar">
          <h2>Create your smart digital identity</h2>
          <p>Build your profile, generate QR codes, and share your contact details anytime.</p>
          
          <div className="mini-card-preview">
            <div className="mini-qr">QR</div>
            <div className="mini-text">
              <h4>QRCard Preview</h4>
              <span>Digital Profile</span>
              <p>Online + Offline QR</p>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE: REGISTRATION FORM */}
        <section className="auth-form-section">
          <div className="form-box">
            <h2>Create Account</h2>
            <p className="form-subtitle">Start creating your digital visiting card today.</p>
            
            <form>
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" placeholder="Enter your full name" required />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input type="email" placeholder="Enter your full email" required />
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="Enter your number" required />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input type="password" placeholder="Create a password" required />
              </div>

              <div className="form-footer">
                <span>Already have an account?</span>
                <NavLink to="/login" className="btn-login-submit">Login</NavLink>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Register;