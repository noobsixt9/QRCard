import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./CSS/index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId || clientId.includes("your_google_client_id")) {
  console.warn(
    "⚠️ Google OAuth Client ID is missing or invalid in Frontend/.env. " +
    "Please set VITE_GOOGLE_CLIENT_ID to your Google Cloud Console Client ID to enable Google Sign-In."
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId || ""}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);