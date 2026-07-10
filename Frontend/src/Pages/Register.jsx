// import React from 'react';
// import Header from '../Component/Header';
// import { NavLink } from 'react-router-dom';
// import '../CSS/Register.css';

// const Register = () => {
//   return (
//     <div className="page-wrapper">
//       <Header />

//       <main className="auth-container">
//         {/* LEFT SIDE: BLUE BRAND CARD */}
//         <section className="auth-sidebar">
//           <h2>Create your smart digital identity</h2>
//           <p>Build your profile, generate QR codes, and share your contact details anytime.</p>

//           <div className="mini-card-preview">
//             <div className="mini-qr">QR</div>
//             <div className="mini-text">
//               <h4>QRCard Preview</h4>
//               <span>Digital Profile</span>
//               <p>Online + Offline QR</p>
//             </div>
//           </div>
//         </section>

//         {/* RIGHT SIDE: REGISTRATION FORM */}
//         <section className="auth-form-section">
//           <div className="form-box">
//             <h2>Create Account</h2>
//             <p className="form-subtitle">Start creating your digital visiting card today.</p>

//             <form>
//               <div className="input-group">
//                 <label>Full Name</label>
//                 <input type="text" placeholder="Enter your full name" required />
//               </div>

//               <div className="input-group">
//                 <label>Email Address</label>
//                 <input type="email" placeholder="Enter your full email" required />
//               </div>

//               <div className="input-group">
//                 <label>Phone Number</label>
//                 <input type="tel" placeholder="Enter your number" required />
//               </div>

//               <div className="input-group">
//                 <label>Password</label>
//                 <input type="password" placeholder="Create a password" required />
//               </div>

//               <div className="form-footer">
//                 <span>Already have an account?</span>
//                 <NavLink to="/login" className="btn-login-submit">Login</NavLink>
//               </div>
//             </form>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default Register;

import { useState, useEffect } from "react";
import Header from "../Component/Header";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "../CSS/Register.css";
import { API_URL } from "../config/api";

const Register = () => {
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");

  const isFormValid =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.password.trim();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError("");

    if (name === "fullName") {
      setFormData({
        ...formData,
        fullName: value.replace(/[^a-zA-Z\s]/g, ""),
      });
      return;
    }

    if (name === "phone") {
      setFormData({
        ...formData,
        phone: value.replace(/\D/g, ""),
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };
async function sendData() {
  try {
    const username = formData.fullName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20);

    const response = await fetch(
      `${API_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email: formData.email.trim(),
          password: formData.password,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Registration failed.");
    }

    console.log("Registration successful:", result);
    navigate(`/verify-otp?email=${encodeURIComponent(formData.email.trim())}&purpose=REGISTRATION`);
  } catch (error) {
    console.error("Registration error:", error.message);
    setError(error.message);
  }
}
  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Test")

    if (!isFormValid) {
      setError("Please fill all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    await sendData();

    // localStorage.setItem("userRole", "user");
    // localStorage.setItem(
    //   "user",
    //   JSON.stringify({
    //     name: formData.fullName,
    //     email: formData.email,
    //     phone: formData.phone,
    //   })
    // );

    // navigate("/dashboard");


  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setError("");

      if (!credentialResponse.credential) {
        setError("Google registration failed. Please try again.");
        return;
      }

      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Google registration failed.");
      }

      const token = result.data?.token;
      const user = result.data?.user;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role?.toLowerCase());

        if (user.role === "ADMIN") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        throw new Error("Invalid response payload from server.");
      }
    } catch (err) {
      setError(err.message || "Google registration failed. Please try again.");
    }
  };

  return (
    <div className="page-wrapper register-page">
      <Header />

      <main className="auth-container">
        <section className="auth-sidebar">
          <h2>Create your smart digital identity</h2>
          <p>
            Build your profile, generate QR codes, and share your contact
            details anytime.
          </p>

          <div className="mini-card-preview">
            <div className="mini-qr">QR</div>
            <div className="mini-text">
              <h4>QRCard Preview</h4>
              <span>Digital Profile</span>
              <p>Online + Offline QR</p>
            </div>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="form-box">
            <h2>Create Account</h2>
            <p className="form-subtitle">
              Start creating your digital visiting card today.
            </p>

            <form onSubmit={handleRegister}>
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="15"
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>



              {error && <p className="auth-error-message">{error}</p>}

              <button
                type="submit"
                className="btn-register-primary"
                disabled={!isFormValid}
              >
                Create Account
              </button>

              <div className="auth-divider">or</div>

              <div className="google-login-wrapper">
                {(!import.meta.env.VITE_GOOGLE_CLIENT_ID || 
                  import.meta.env.VITE_GOOGLE_CLIENT_ID.includes("your_google_client_id") || 
                  import.meta.env.VITE_GOOGLE_CLIENT_ID.includes("xxxxxxxxxxxxxxxx") || 
                  import.meta.env.VITE_GOOGLE_CLIENT_ID.startsWith("1234567890-")) ? (
                  <button
                    type="button"
                    className="btn-google-auth"
                    style={{ marginTop: "10px" }}
                    onClick={() => handleGoogleLogin({ credential: "dev_mode_bypass_token" })}
                  >
                    <svg
                      style={{ width: "16px", height: "16px" }}
                      viewBox="0 0 48 48"
                    >
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.78H24v9.03h12.75c-.55 2.94-2.21 5.44-4.71 7.11v5.9h7.62c4.46-4.1 7.03-10.13 7.03-17.26z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.62-5.9c-2.11 1.41-4.8 2.25-8.27 2.25-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() =>
                      setError("Google registration failed. Please try again.")
                    }
                    text="continue_with"
                    shape="rectangular"
                    width="100%"
                  />
                )}
              </div>

              <div className="form-footer">
                <span>Already have an account?</span>
                <NavLink to="/login" className="btn-login-submit">
                  Login
                </NavLink>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Register;