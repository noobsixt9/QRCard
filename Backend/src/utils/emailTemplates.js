function orderReceiptEmail(order, user) {
  return `
    <h2>QRCard Order Confirmed #${order.id}</h2>
    <p>Hi ${user.profile?.full_name || user.username},</p>
    <p>Your printing order has been confirmed.</p>
    <ul>
      <li><strong>Quantity:</strong> ${order.quantity}</li>
      <li><strong>QR Type:</strong> ${order.qr_type}</li>
      <li><strong>Status:</strong> ${order.status}</li>
    </ul>
    <p>Thank you for using QRCard Nepal!</p>
  `
}

function vendorOrderEmail(order, user, vendor) {
  return `
    <h2>New QRCard Print Order #${order.id}</h2>
    <p>Hi ${vendor.name},</p>
    <p>A new print order has been assigned to you.</p>
    <h3>Order Details</h3>
    <ul>
      <li><strong>Quantity:</strong> ${order.quantity}</li>
      <li><strong>QR Type:</strong> ${order.qr_type}</li>
      <li><strong>Template:</strong> ${order.design_config?.template || 'default'}</li>
      <li><strong>Notes:</strong> ${order.notes || 'None'}</li>
    </ul>
    <h3>Customer</h3>
    <ul>
      <li><strong>Name:</strong> ${user.profile?.full_name || user.username}</li>
      <li><strong>Email:</strong> ${user.email}</li>
      <li><strong>Phone:</strong> ${user.profile?.phone || 'N/A'}</li>
    </ul>
    <p>Print-ready PDF is attached.</p>
  `
}

module.exports = { orderReceiptEmail, vendorOrderEmail }
