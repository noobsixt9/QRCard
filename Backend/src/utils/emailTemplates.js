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

function otpEmailTemplate(code, purpose) {
  const purposeText = purpose === 'REGISTRATION' ? 'Verify your email registration' : 'Reset your password';
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #4f6bed; text-align: center;">QRCard Security Verification</h2>
      <p>Hello,</p>
      <p>We received a request to <strong>${purposeText}</strong>. Please use the following 6-digit One-Time Password (OTP) to complete the verification:</p>
      <div style="text-align: center; margin: 30px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #111827;">
        ${code}
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code is valid for 10 minutes. If you did not make this request, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">QRCard Nepal · NCIT Final Year Project</p>
    </div>
  `
}

function signupOtpEmail(otp, expiresMinutes) {
  return `
    <h2>Verify your QRCard account</h2>
    <p>Use this one-time code to complete your signup:</p>
    <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
    <p>This code expires in ${expiresMinutes} minutes.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `
}

module.exports = { orderReceiptEmail, vendorOrderEmail, otpEmailTemplate, signupOtpEmail }
