import { useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import "../../CSS/Admin/AdminPages.css";

const AdminVendors = () => {
  const [notice, setNotice] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");

  const [vendors, setVendors] = useState([
    {
      id: 1,
      name: "PrintHub Nepal",
      phone: "9800000000",
      location: "Kathmandu",
      activeOrders: 6,
      status: "Active",
    },
    {
      id: 2,
      name: "CardPress Studio",
      phone: "9811111111",
      location: "Lalitpur",
      activeOrders: 3,
      status: "Active",
    },
    {
      id: 3,
      name: "Fast Print Service",
      phone: "9822222222",
      location: "Bhaktapur",
      activeOrders: 0,
      status: "Blocked",
    },
  ]);

  const addVendor = (e) => {
    e.preventDefault();

    if (!vendorName.trim() || !vendorPhone.trim()) {
      setNotice("Please enter vendor name and phone number.");
      return;
    }

    const newVendor = {
      id: Date.now(),
      name: vendorName,
      phone: vendorPhone,
      location: "Kathmandu",
      activeOrders: 0,
      status: "Active",
    };

    setVendors((prev) => [newVendor, ...prev]);
    setVendorName("");
    setVendorPhone("");
    setNotice("Vendor added successfully.");
  };

  const toggleVendor = (id) => {
    setVendors((prev) =>
      prev.map((vendor) =>
        vendor.id === id
          ? {
              ...vendor,
              status: vendor.status === "Active" ? "Blocked" : "Active",
            }
          : vendor
      )
    );

    setNotice("Vendor status updated.");
  };

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-page-main">
        <header className="admin-page-header">
          <div>
            <h1>Vendors</h1>
            <p>Manage printing and delivery vendors for card orders.</p>
          </div>
        </header>

        <section className="admin-mini-stats">
          <div className="admin-mini-card">
            <p>Total Vendors</p>
            <h2>{vendors.length}</h2>
            <span className="text-blue">Registered vendors</span>
          </div>

          <div className="admin-mini-card">
            <p>Active Vendors</p>
            <h2>{vendors.filter((v) => v.status === "Active").length}</h2>
            <span className="text-green">Available</span>
          </div>

          <div className="admin-mini-card">
            <p>Blocked</p>
            <h2>{vendors.filter((v) => v.status === "Blocked").length}</h2>
            <span className="text-red">Unavailable</span>
          </div>

          <div className="admin-mini-card">
            <p>Active Orders</p>
            <h2>{vendors.reduce((sum, v) => sum + v.activeOrders, 0)}</h2>
            <span className="text-purple">Assigned orders</span>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-title">
            <div>
              <h2>Add Vendor</h2>
              <p>Add a printing vendor for future order assignment.</p>
            </div>
          </div>

          <form className="admin-form-grid" onSubmit={addVendor}>
            <div className="admin-input-group">
              <label>Vendor Name</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Enter vendor name"
              />
            </div>

            <div className="admin-input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={vendorPhone}
                onChange={(e) =>
                  setVendorPhone(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter phone number"
                maxLength="15"
              />
            </div>

            <button type="submit" className="admin-btn primary">
              Add Vendor
            </button>
          </form>

          {notice && <p className="admin-form-message">{notice}</p>}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-title">
            <div>
              <h2>Vendor List</h2>
              <p>View active orders and vendor availability.</p>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Active Orders</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>{vendor.name}</td>
                    <td>{vendor.phone}</td>
                    <td>{vendor.location}</td>
                    <td>{vendor.activeOrders}</td>
                    <td>
                      <span
                        className={`admin-pill ${
                          vendor.status === "Active" ? "active" : "blocked"
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`admin-icon-action ${
                          vendor.status === "Active" ? "danger" : ""
                        }`}
                        onClick={() => toggleVendor(vendor.id)}
                      >
                        {vendor.status === "Active" ? "Block" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminVendors;