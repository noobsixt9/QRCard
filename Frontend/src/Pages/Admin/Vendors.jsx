import { useEffect, useState } from "react";
import AdminSidebar from "../../Component/Admin/AdminSidebar";
import { API_URL, getHeaders } from "../../config/api";
import "../../CSS/Admin/AdminPages.css";

const AdminVendors = () => {
  const [notice, setNotice] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_URL}/admin/vendors`, {
          method: "GET",
          headers: getHeaders(),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to load vendors");
        }

        setVendors(result.data || []);
      } catch (err) {
        console.error("Fetch vendors error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const addVendor = async (e) => {
    e.preventDefault();

    if (!vendorName.trim() || !vendorPhone.trim() || !vendorEmail.trim()) {
      setNotice("Please enter vendor name, phone number, and email.");
      return;
    }

    try {
      setNotice("Adding vendor...");
      const response = await fetch(`${API_URL}/admin/vendors`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          name: vendorName.trim(),
          phone: vendorPhone.trim(),
          email: vendorEmail.trim(),
          address: vendorAddress.trim() || "Kathmandu",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to create vendor");
      }

      setVendors((prev) => [result.data, ...prev]);
      setVendorName("");
      setVendorPhone("");
      setVendorEmail("");
      setVendorAddress("");
      setNotice("Vendor added successfully.");
    } catch (err) {
      console.error("Add vendor error:", err.message);
      setNotice(err.message);
    }
  };

  const toggleVendor = async (id, isActive) => {
    try {
      setNotice("");
      let response;
      if (isActive) {
        // Deactivate vendor
        response = await fetch(`${API_URL}/admin/vendors/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
      } else {
        // Activate vendor
        response = await fetch(`${API_URL}/admin/vendors/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ is_active: true }),
        });
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update vendor status");
      }

      setVendors((prev) =>
        prev.map((vendor) =>
          vendor.id === id
            ? {
                ...vendor,
                is_active: !isActive,
              }
            : vendor
        )
      );

      setNotice(`Vendor status updated.`);
    } catch (err) {
      console.error("Toggle vendor error:", err.message);
      setNotice(err.message);
    }
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

        {error && <div className="admin-form-message error-message">{error}</div>}

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading vendors list...</p>
          </div>
        ) : (
          <>
            <section className="admin-mini-stats">
              <div className="admin-mini-card">
                <p>Total Vendors</p>
                <h2>{vendors.length}</h2>
                <span className="text-blue">Registered vendors</span>
              </div>

              <div className="admin-mini-card">
                <p>Active Vendors</p>
                <h2>{vendors.filter((v) => v.is_active).length}</h2>
                <span className="text-green">Available</span>
              </div>

              <div className="admin-mini-card">
                <p>Blocked</p>
                <h2>{vendors.filter((v) => !v.is_active).length}</h2>
                <span className="text-red">Unavailable</span>
              </div>

              <div className="admin-mini-card">
                <p>Total Actions</p>
                <h2>{vendors.length}</h2>
                <span className="text-purple">Registered vendor contacts</span>
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
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    placeholder="Enter vendor email"
                    required
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
                    required
                  />
                </div>

                <div className="admin-input-group">
                  <label>Location / Address</label>
                  <input
                    type="text"
                    value={vendorAddress}
                    onChange={(e) => setVendorAddress(e.target.value)}
                    placeholder="Enter address (e.g. Kathmandu)"
                  />
                </div>

                <div style={{ gridColumn: "span 2", marginTop: "10px" }}>
                  <button type="submit" className="admin-btn primary">
                    + Add Vendor
                  </button>
                </div>
              </form>

              {notice && <p className="admin-form-message">{notice}</p>}
            </section>

            <section className="admin-panel">
              <div className="admin-panel-title">
                <div>
                  <h2>Vendor List</h2>
                  <p>View vendor availability and details.</p>
                </div>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Vendor</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vendors.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                          No vendors registered.
                        </td>
                      </tr>
                    ) : (
                      vendors.map((vendor) => (
                        <tr key={vendor.id}>
                          <td>{vendor.name}</td>
                          <td>{vendor.email}</td>
                          <td>{vendor.phone || "N/A"}</td>
                          <td>{vendor.address || "N/A"}</td>
                          <td>
                            <span
                              className={`admin-pill ${
                                vendor.is_active ? "active" : "blocked"
                              }`}
                            >
                              {vendor.is_active ? "Active" : "Blocked"}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`admin-icon-action ${
                                vendor.is_active ? "danger" : ""
                              }`}
                              onClick={() => toggleVendor(vendor.id, vendor.is_active)}
                            >
                              {vendor.is_active ? "Block" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminVendors;