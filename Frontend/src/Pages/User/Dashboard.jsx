import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import "../../CSS/User/Dashboard.css";
import { API_URL, getHeaders } from "../../config/api";
import { cachedFetch, invalidate, CACHE } from "../../utils/cache";

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser]   = useState(null);
  const [profileScore, setProfileScore] = useState(0);
  const [qrCount, setQrCount]           = useState(0);
  const [scanCount, setScanCount]       = useState(0);
  const [ordersCount, setOrdersCount]   = useState(0);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) { navigate("/login", { replace: true }); return; }

        const headers = getHeaders();

        const [user, profile, qrData, orders] = await Promise.all([
          cachedFetch(CACHE.ME,      `${API_URL}/auth/me`,     { headers }),
          cachedFetch(CACHE.PROFILE, `${API_URL}/profile`,     { headers }),
          cachedFetch(CACHE.QR,      `${API_URL}/qr`,          { headers }),
          cachedFetch(CACHE.ORDERS,  `${API_URL}/orders`,      { headers }),
        ]);

        if (user)    setCurrentUser(user);
        if (profile) setProfileScore((profile?.profile || profile)?.completeness_score || 0);

        if (qrData) {
          // /qr returns { online: {...}, offline: {...} } — an object, not an array
          const count = (qrData.online ? 1 : 0) + (qrData.offline ? 1 : 0);
          setQrCount(count);
          // scan_count is only tracked on online QR
          setScanCount(qrData.online?.scan_count || 0);
        }

        if (orders) {
          // /orders returns { orders: [...], meta: {...} }
          const list = Array.isArray(orders) ? orders : (orders?.orders || []);
          setOrdersCount(list.length);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [navigate]);

  const username = currentUser?.username || "Loading...";

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Manage your digital profile, QR codes, card design, and orders.</p>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner" />
            <p>Loading your dashboard…</p>
          </div>
        ) : (
          <>
            <section className="dashboard-stats">
              <div className="dashboard-stat-card" onClick={() => navigate("/digital-profile")} style={{ cursor: "pointer" }}>
                <p>Profile Score</p>
                <h2>{profileScore}%</h2>
                <span className={profileScore >= 80 ? "green-text" : "orange-text"}>
                  {profileScore >= 80 ? "Excellent Profile" : "Improve Profile"}
                </span>
              </div>

              <div className="dashboard-stat-card" onClick={() => navigate("/qr-codes")} style={{ cursor: "pointer" }}>
                <p>QR Codes</p>
                <h2>{qrCount}</h2>
                <span>Online + VCard</span>
              </div>

              <div className="dashboard-stat-card" onClick={() => navigate("/qr-codes")} style={{ cursor: "pointer" }}>
                <p>Total Scans</p>
                <h2>{scanCount}</h2>
                <span className="blue-text">Profile views</span>
              </div>

              <div className="dashboard-stat-card" onClick={() => navigate("/orders")} style={{ cursor: "pointer" }}>
                <p>Orders</p>
                <h2>{ordersCount}</h2>
                <span className="blue-text">My print orders</span>
              </div>

              <div className="dashboard-stat-card" onClick={() => navigate("/digital-profile")} style={{ cursor: "pointer" }}>
                <p>AI Suggestions</p>
                <h2>{profileScore < 100 ? 1 : 0}</h2>
                <span className="purple-text">Improve Profile</span>
              </div>
            </section>

            <h2 className="quick-title">Quick Actions</h2>

            <section className="dashboard-actions">
              <div className="dashboard-action-card">
                <h3>Edit Digital Profile</h3>
                <p>Update your personal, contact, and social media details.</p>
                <button type="button" className="action-btn" onClick={() => navigate("/digital-profile")}>Edit Profile</button>
              </div>

              <div className="dashboard-action-card">
                <h3>Generate QR Card</h3>
                <p>Create online profile QR or offline vCard QR.</p>
                <button type="button" className="action-btn" onClick={() => navigate("/qr-codes")}>Generate QR</button>
              </div>

              <div className="dashboard-action-card">
                <h3>AI Bio Generator</h3>
                <p>Generate a professional bio from your profile.</p>
                <button type="button" className="action-btn" onClick={() => navigate("/digital-profile")}>Generate Bio</button>
              </div>

              <div className="dashboard-action-card">
                <h3>Design Visiting Card</h3>
                <p>Choose template, QR type, and preview your card.</p>
                <button type="button" className="action-btn" onClick={() => navigate("/card-design")}>Design Card</button>
              </div>

              <div className="dashboard-action-card">
                <h3>Place Print Order</h3>
                <p>Order printed visiting cards from your selected design.</p>
                <button type="button" className="action-btn" onClick={() => navigate("/printing-order")}>Place Order</button>
              </div>

              <div className="dashboard-action-card">
                <h3>View Public Profile</h3>
                <p>Preview how others see your profile after scanning QR.</p>
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => {
                    if (currentUser?.username) window.open(`/u/${currentUser.username}`, "_blank");
                  }}
                >
                  View Profile
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
