import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import AdminGuard from "./Component/Admin/AdminGuard";
import UserGuard  from "./Component/UserGuard";
import "./CSS/App.css";
import "./CSS/compiled-final.css";
import "./CSS/responsive.css";
import Register from './Pages/Register';
import Login from './Pages/Login';
import OTPVerification from "./Pages/OTPVerification";
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
import VerifyHuman from "./Pages/VerifyHuman";
import AdminLogin from "./Pages/Admin/AdminLogin";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminUsers from "./Pages/Admin/Users";
import AdminProfiles from "./Pages/Admin/Profiles";
import AdminOrders from "./Pages/Admin/Orders";
import AdminDesignRequests from "./Pages/Admin/DesignRequests";
import AdminVendors from "./Pages/Admin/Vendors";
import AdminSettings from "./Pages/Admin/Settings";




const App = () => {
  // Single source of truth for theme — applied once at the root, persists everywhere
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);

    const syncTheme = () => {
      const t = localStorage.getItem("theme") || "light";
      document.documentElement.setAttribute("data-theme", t);
    };
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/dashboard"       element={<UserGuard><Dashboard /></UserGuard>} />
        <Route path="/digital-profile" element={<UserGuard><DigitalProfile /></UserGuard>} />
        <Route path="/qr-codes"        element={<UserGuard><QRCodes /></UserGuard>} />
        <Route path="/ai-bio"          element={<UserGuard><AIBio /></UserGuard>} />
        <Route path="/card-design"     element={<UserGuard><CardDesign /></UserGuard>} />
        <Route path="/orders"          element={<UserGuard><Orders /></UserGuard>} />
        <Route path="/printing-order"  element={<UserGuard><PrintingOrders /></UserGuard>} />
        <Route path="/settings"        element={<UserGuard><Settings /></UserGuard>} />

        <Route path="/u/:username" element={<PublicProfile />} />
        <Route path="/verify-human" element={<VerifyHuman />} />
        <Route path="*" element={<ErrorPage />} />

        {/* Admin entry point */}
        <Route path="/admin" element={<AdminLogin />} />

        <Route path="/admin-dashboard"       element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/admin-users"           element={<AdminGuard><AdminUsers /></AdminGuard>} />
        <Route path="/admin-profiles"        element={<AdminGuard><AdminProfiles /></AdminGuard>} />
        <Route path="/admin-orders"          element={<AdminGuard><AdminOrders /></AdminGuard>} />
        <Route path="/admin-design-requests" element={<AdminGuard><AdminDesignRequests /></AdminGuard>} />
        <Route path="/admin-vendors"         element={<AdminGuard><AdminVendors /></AdminGuard>} />
        <Route path="/admin-settings"        element={<AdminGuard><AdminSettings /></AdminGuard>} />

      </Routes>

    </BrowserRouter>
  )
}

export default App
