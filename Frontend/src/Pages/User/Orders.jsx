import { Link } from "react-router-dom";
import Sidebar from "../../Component/User/Sidebar";
import "../../CSS/User/Orders.css";

const Orders = () => {
  return (
    <div className="my-orders-page">
      <Sidebar />

      <main className="my-orders-main">
        <div className="my-orders-header">
          <div>
            <h1>My Orders</h1>
            <p>View and manage your visiting card printing orders.</p>
          </div>

          <Link to="/printing-order" className="new-order-btn">
            New Order
          </Link>
        </div>

        <section className="order-stats-grid">
          <div className="order-stat-card">
            <p>Total Orders</p>
            <h2>4</h2>
          </div>

          <div className="order-stat-card">
            <p>Pending</p>
            <h2 className="pending-number">1</h2>
          </div>

          <div className="order-stat-card">
            <p>Processing</p>
            <h2 className="processing-number">2</h2>
          </div>

          <div className="order-stat-card">
            <p>Completed</p>
            <h2 className="completed-number">2</h2>
          </div>
        </section>

        <section className="recent-orders-card">
          <div className="recent-orders-header">
            <h2>Recent Orders</h2>
            <input type="text" placeholder="Search order" />
          </div>

          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Template</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>#ORD-001</td>
                  <td>Minimal</td>
                  <td>100</td>
                  <td>Today</td>
                  <td>
                    <span className="status-badge pending">Pending</span>
                  </td>
                  <td>
                    <button className="view-details-btn">View Details</button>
                  </td>
                </tr>

                <tr>
                  <td>#ORD-002</td>
                  <td>Professional</td>
                  <td>200</td>
                  <td>Jun 2, 2026</td>
                  <td>
                    <span className="status-badge processing">Processing</span>
                  </td>
                  <td>
                    <button className="view-details-btn">View Details</button>
                  </td>
                </tr>

                <tr>
                  <td>#ORD-003</td>
                  <td>Minimal</td>
                  <td>500</td>
                  <td>May 25, 2026</td>
                  <td>
                    <span className="status-badge completed">Completed</span>
                  </td>
                  <td>
                    <button className="view-details-btn">View Details</button>
                  </td>
                </tr>

                <tr>
                  <td>#ORD-004</td>
                  <td>Creative</td>
                  <td>100</td>
                  <td>May 20, 2026</td>
                  <td>
                    <span className="status-badge cancelled">Cancelled</span>
                  </td>
                  <td>
                    <button className="view-details-btn">View Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Orders;