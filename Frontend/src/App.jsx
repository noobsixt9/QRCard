import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./CSS/App.css";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import OTPVerification from "./Pages/OTPVerification";
import VerifyHuman from "./Pages/VerifyHuman";
import ErrorPage from "./Pages/ErrorPage";
import LandingPage from "./Pages/LandingPage";
import Dashboard from "./Pages/User/Dashboard";
import DigitalProfile from "./Pages/User/DigitalProfile";
import QRCodes from "./Pages/User/QRCodes";
import AIBio from "./Pages/User/AIBio";
import CardDesign from "./Pages/User/CardDesign";
import Orders from "./Pages/User/Orders";
import PrintingOrders from "./Pages/User/PrintingOrders";
import Settings from "./Pages/User/Settings";
import PublicProfile from "./Pages/PublicProfile";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminUsers from "./Pages/Admin/Users";
import AdminProfiles from "./Pages/Admin/Profiles";
import AdminOrders from "./Pages/Admin/Orders";
import AdminDesignRequests from "./Pages/Admin/DesignRequests";
import AdminVendors from "./Pages/Admin/Vendors";
import AdminSettings from "./Pages/Admin/Settings";
import ProtectedRoute from "./Component/ProtectedRoute";
import GuestRoute from "./Component/GuestRoute";

const App = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        const target = e.target;
        const isInput =
          target.tagName === "INPUT" &&
          ["text", "email", "password", "tel", "number", "url"].includes(target.type);

        if (isInput) {
          const form = target.form;
          const selector = 'input:not([type="submit"]):not([type="button"]):not([type="hidden"]):not([disabled]):not([readonly])';
          const container = form || document;
          const inputs = Array.from(container.querySelectorAll(selector)).filter(
            (input) => {
              const rect = input.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0;
            }
          );

          const index = inputs.indexOf(target);
          if (index > -1 && index < inputs.length - 1) {
            e.preventDefault();
            inputs[index + 1].focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/verify-human" element={<VerifyHuman />} />
        <Route path="/u/:username" element={<PublicProfile />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["USER", "ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/digital-profile"
          element={
            <ProtectedRoute roles={["USER", "ADMIN"]}>
              <DigitalProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr-codes"
          element={
            <ProtectedRoute roles={["USER", "ADMIN"]}>
              <QRCodes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-bio"
          element={
            <ProtectedRoute roles={["USER", "ADMIN"]}>
              <AIBio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/card-design"
          element={
            <ProtectedRoute roles={["USER", "ADMIN"]}>
              <CardDesign />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={["USER", "ADMIN"]}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/printing-order"
          element={
            <ProtectedRoute roles={["USER", "ADMIN"]}>
              <PrintingOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute roles={["USER", "ADMIN"]}>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-profiles"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminProfiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-orders"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-design-requests"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminDesignRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-vendors"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminVendors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-settings"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
