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
import Sidebar from "../../Component/User/Sidebar";
import "../../CSS/User/Dashboard.css";
import { API_URL, getHeaders } from "../../config/api";

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${API_URL}/auth/me`,
          {
            method: "GET",
            headers: getHeaders(),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to retrieve user information"
          );
        }

        console.log("Logged-in user:", result.data);
        setCurrentUser(result.data);
      } catch (error) {
        console.error("User fetch error:", error.message);
      }
    }

    getCurrentUser();
  }, []);

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

        <section className="dashboard-stats">
          <div className="dashboard-stat-card">
            <p>Profile Score</p>
            <h2>75%</h2>
            <span className="green-text">Good Progress</span>
          </div>

          <div className="dashboard-stat-card">
            <p>QR Codes</p>
            <h2>2</h2>
            <span>Online + VCard</span>
          </div>

          <div className="dashboard-stat-card">
            <p>Orders</p>
            <h2>1</h2>
            <span className="orange-text">Pending Order</span>
          </div>

          <div className="dashboard-stat-card">
            <p>AI Suggestions</p>
            <h2>2</h2>
            <span className="purple-text">Improve Profile</span>
          </div>
        </section>

        <h2 className="quick-title">Quick Actions</h2>

        <section className="dashboard-actions">
          <div className="dashboard-action-card">
            <h3>Edit Digital Profile</h3>
            <p>Update your personal, contact, and social media details.</p>
            <button type="button">Edit Profile</button>
          </div>

          <div className="dashboard-action-card">
            <h3>Generate QR Card</h3>
            <p>Create online profile QR or offline vCard QR.</p>
            <button type="button">Generate QR</button>
          </div>

          <div className="dashboard-action-card">
            <h3>AI Bio Generator</h3>
            <p>Generate a professional bio and profile suggestions.</p>
            <button type="button">Use AI</button>
          </div>

          <div className="dashboard-action-card">
            <h3>Design Visiting Card</h3>
            <p>Choose template, QR type, and preview your card.</p>
            <button type="button">Design Card</button>
          </div>

          <div className="dashboard-action-card">
            <h3>Place Print Order</h3>
            <p>Order printed visiting cards from your selected design.</p>
            <button type="button">Place Order</button>
          </div>

          <div className="dashboard-action-card">
            <h3>View Public Profile</h3>
            <p>Preview how others see your profile after scanning QR.</p>
            <button type="button">View Profile</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;