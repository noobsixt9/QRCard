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

function signupOtpEmail(otp, expiresMinutes) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#6366f1,#7c3aed);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">QRCard</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Digital Visiting Card Platform</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:800;">Verify your account</h2>
          <p style="margin:0 0 28px;color:#64748b;font-size:14px;line-height:1.6;">
            Use this one-time code to complete your signup:
          </p>
          <div style="background:#f8fafc;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;border:1px solid #e2e8f0;">
            <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#0f172a;font-family:monospace;">${otp}</span>
          </div>
          <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;line-height:1.6;">
            This code is valid for <strong>${expiresMinutes} minutes</strong>. If you did not create an account, you can safely ignore this email.
          </p>
        </td></tr>
        <tr><td style="padding:20px 40px 32px;border-top:1px solid #f1f5f9;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">QRCard Nepal · NCIT Final Year Project</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function passwordResetEmail(otp, expiresMinutes) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#6366f1,#7c3aed);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">QRCard Security Verification</h1>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;color:#0f172a;font-size:15px;">Hello,</p>
          <p style="margin:0 0 28px;color:#475569;font-size:14px;line-height:1.7;">
            We received a request to <strong>Reset your password</strong>. Please use the following 6-digit One-Time Password (OTP) to complete the verification:
          </p>
          <div style="background:#f8fafc;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;border:1px solid #e2e8f0;">
            <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#0f172a;font-family:monospace;">${otp}</span>
          </div>
          <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;border-top:1px solid #f1f5f9;padding-top:20px;">
            This code is valid for <strong>${expiresMinutes} minutes</strong>. If you did not make this request, please ignore this email.
          </p>
        </td></tr>
        <tr><td style="padding:20px 40px 32px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">QRCard Nepal · NCIT Final Year Project</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

module.exports = { orderReceiptEmail, vendorOrderEmail, signupOtpEmail, passwordResetEmail }
