import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./CSS/App.css";
import Register from './Pages/Register';
import Login from './Pages/Login';
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

import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminUsers from "./Pages/Admin/Users";
import AdminProfiles from "./Pages/Admin/Profiles";
import AdminOrders from "./Pages/Admin/Orders";
import AdminDesignRequests from "./Pages/Admin/DesignRequests";
import AdminVendors from "./Pages/Admin/Vendors";
import AdminSettings from "./Pages/Admin/Settings";




const App = () => {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/digital-profile" element={<DigitalProfile />} />
        <Route path="*" element={<ErrorPage />} />
        <Route path="/qr-codes" element={<QRCodes />} />
        <Route path="/ai-bio" element={<AIBio />} />
        <Route path="/card-design" element={<CardDesign />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/printing-order" element={<PrintingOrders />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-users" element={<AdminUsers />} />
        <Route path="/admin-profiles" element={<AdminProfiles />} />
        <Route path="/admin-orders" element={<AdminOrders />} />
        <Route path="/admin-design-requests" element={<AdminDesignRequests />} />
        <Route path="/admin-vendors" element={<AdminVendors />} />
        <Route path="/admin-settings" element={<AdminSettings />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App
