// import { useEffect } from "react";
// import Sidebar from "../../Component/User/Sidebar";
// import "../../CSS/User/Dashboard.css";
// const Dashboard = () => {
//   useEffect(()=> {
//     async function getCurrentUser() {
//       const token = localStorage.getItem("token");
    
//       const response = await fetch(
//         "http://localhost:5001/api/profile/",
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
    
//       const result = await response.json();
    
//       if (!response.ok) {
//         throw new Error(result.message || "Failed to retrieve user information");
//       }
    
//       console.log(result.data);
//       return result.data;
//     }
//     getCurrentUser()

//   }, [])
//   return (
//     <div className="dashboard-page">
//       <Sidebar />

//       <main className="dashboard-main">
//         <div className="dashboard-header">
//           <div>
//             <h1>Dashboard</h1>
//             <p>Manage your digital profile, QR codes, card design, and orders.</p>
//           </div>

//           <div className="dashboard-user">
//             <div className="user-avatar">AK</div>
//             <div>
//               <h4>Alina Khatun</h4>
//               <span>User</span>
//             </div>
//           </div>
//         </div>

//         <section className="dashboard-stats">
//           <div className="dashboard-stat-card">
//             <p>Profile Score</p>
//             <h2>75%</h2>
//             <span className="green-text">Good Progress</span>
//           </div>

//           <div className="dashboard-stat-card">
//             <p>QR Codes</p>
//             <h2>2</h2>
//             <span>Online + VCard</span>
//           </div>

//           <div className="dashboard-stat-card">
//             <p>Orders</p>
//             <h2>1</h2>
//             <span className="orange-text">Pending Order</span>
//           </div>

//           <div className="dashboard-stat-card">
//             <p>AI Suggestions</p>
//             <h2>2</h2>
//             <span className="purple-text">Improve Profile</span>
//           </div>
//         </section>

//         <h2 className="quick-title">Quick Actions</h2>

//         <section className="dashboard-actions">
//           <div className="dashboard-action-card">
//             <h3>Edit Digital Profile</h3>
//             <p>Update your personal, contact, and social media details.</p>
//             <button>Edit Profile</button>
//           </div>

//           <div className="dashboard-action-card">
//             <h3>Generate QR Card</h3>
//             <p>Create online profile QR or offline vCard QR.</p>
//             <button>Generate QR</button>
//           </div>

//           <div className="dashboard-action-card">
//             <h3>AI Bio Generator</h3>
//             <p>Generate a professional bio and profile suggestions.</p>
//             <button>Use AI</button>
//           </div>

//           <div className="dashboard-action-card">
//             <h3>Design Visiting Card</h3>
//             <p>Choose template, QR type, and preview your card.</p>
//             <button>Design Card</button>
//           </div>

//           <div className="dashboard-action-card">
//             <h3>Place Print Order</h3>
//             <p>Order printed visiting cards from your selected design.</p>
//             <button>Place Order</button>
//           </div>

//           <div className="dashboard-action-card">
//             <h3>View Public Profile</h3>
//             <p>Preview how others see your profile after scanning QR.</p>
//             <button>View Profile</button>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;



import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import "../../CSS/User/Dashboard.css";
import { API_URL, getHeaders } from "../../config/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileScore, setProfileScore] = useState(0);
  const [qrCount, setQrCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const headers = getHeaders();

        // Fetch user info, profile details, QR codes, and orders in parallel
        const [userRes, profileRes, qrRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/auth/me`, { headers }),
          fetch(`${API_URL}/profile`, { headers }),
          fetch(`${API_URL}/qrcode`, { headers }),
          fetch(`${API_URL}/orders`, { headers }),
        ]);

        if (userRes.ok) {
          const userResult = await userRes.json();
          setCurrentUser(userResult.data);
        }

        if (profileRes.ok) {
          const profileResult = await profileRes.json();
          const profile = profileResult.data?.profile || profileResult.data || {};
          setProfileScore(profile.completeness_score || 0);
        }

        if (qrRes.ok) {
          const qrResult = await qrRes.json();
          setQrCount(qrResult.data?.length || 0);
        }

        if (ordersRes.ok) {
          const ordersResult = await ordersRes.json();
          setOrdersCount(ordersResult.data?.length || 0);
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

  const initials = currentUser?.username
    ? currentUser.username
        .split("_")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "...";

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>
              Manage your digital profile, QR codes, card design, and orders.
            </p>
          </div>

          <div className="dashboard-user">
            <div className="user-avatar">{initials}</div>

            <div>
              <h4>{username}</h4>
              <span>
                {currentUser?.role === "USER"
                  ? "User"
                  : currentUser?.role || "User"}
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-loading" style={{ padding: "40px 0", textAlign: "center" }}>
            <p>Loading your dashboard details...</p>
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

              <div className="dashboard-stat-card" onClick={() => navigate("/orders")} style={{ cursor: "pointer" }}>
                <p>Orders</p>
                <h2>{ordersCount}</h2>
                <span className="blue-text">My print orders</span>
              </div>

              <div className="dashboard-stat-card" onClick={() => navigate("/ai-bio")} style={{ cursor: "pointer" }}>
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
                <button type="button" onClick={() => navigate("/digital-profile")}>Edit Profile</button>
              </div>

              <div className="dashboard-action-card">
                <h3>Generate QR Card</h3>
                <p>Create online profile QR or offline vCard QR.</p>
                <button type="button" onClick={() => navigate("/qr-codes")}>Generate QR</button>
              </div>

              <div className="dashboard-action-card">
                <h3>AI Bio Generator</h3>
                <p>Generate a professional bio and profile suggestions.</p>
                <button type="button" onClick={() => navigate("/ai-bio")}>Use AI</button>
              </div>

              <div className="dashboard-action-card">
                <h3>Design Visiting Card</h3>
                <p>Choose template, QR type, and preview your card.</p>
                <button type="button" onClick={() => navigate("/card-design")}>Design Card</button>
              </div>

              <div className="dashboard-action-card">
                <h3>Place Print Order</h3>
                <p>Order printed visiting cards from your selected design.</p>
                <button type="button" onClick={() => navigate("/printing-order")}>Place Order</button>
              </div>

              <div className="dashboard-action-card">
                <h3>View Public Profile</h3>
                <p>Preview how others see your profile after scanning QR.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (currentUser?.username) {
                      window.open(`/u/${currentUser.username}`, "_blank");
                    }
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