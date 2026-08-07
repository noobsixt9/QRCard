const { getResend } = require('../config/mailer')
const { orderReceiptEmail, vendorOrderEmail, signupOtpEmail, passwordResetEmail } = require('./emailTemplates')

const SIGNUP_OTP_EXPIRY_MINUTES = 10

async function sendEmail({ to, subject, html, attachments }) {
  const resend = getResend()
  if (!resend) {
    return { sent: false, reason: 'not_configured' }
  }

  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@qrcard.com',
    to,
    subject,
    html,
    attachments,
  })

  if (result.error) {
    console.error('Resend send failed:', result.error.message)
    return { sent: false, reason: result.error.message }
  }

  return { sent: true, id: result.data?.id }
}

async function sendOrderConfirmationEmail(order, user, pdfBuffer) {
  const result = await sendEmail({
    to: user.email,
    subject: `QRCard Order Confirmed #${order.id}`,
    html: orderReceiptEmail(order, user),
    attachments: pdfBuffer
      ? [{ filename: `order-${order.id}.pdf`, content: pdfBuffer }]
      : undefined,
  })

  if (!result.sent && result.reason === 'not_configured') {
    console.warn('Resend not configured — skipping confirmation email')
  }
}

async function sendVendorOrderEmail(order, user, vendor, pdfBuffer, svgBuffer) {
  const attachments = []

  if (pdfBuffer) {
    attachments.push({ filename: `card-preview-${order.id}.pdf`, content: pdfBuffer })
  }

  if (svgBuffer) {
    // SVG as editable/print-ready vector file
    attachments.push({
      filename: `card-design-${order.id}.svg`,
      content: svgBuffer,
      contentType: 'image/svg+xml',
    })
  }

  const result = await sendEmail({
    to: vendor.email,
    subject: `QRCard Print Order #${order.id.slice(0, 8).toUpperCase()} — ${user.username}`,
    html: vendorOrderEmail(order, user, vendor),
    attachments,
  })

  if (!result.sent && result.reason === 'not_configured') {
    console.warn('Resend not configured — skipping vendor email')
  }
}

async function sendSignupOtpEmail(email, otp, purpose) {
  const isReset = purpose === 'PASSWORD_RESET'
  const result = await sendEmail({
    to: email,
    subject: isReset ? 'QRCard - Password Reset OTP' : 'Your QRCard signup verification code',
    html: isReset
      ? passwordResetEmail(otp, SIGNUP_OTP_EXPIRY_MINUTES)
      : signupOtpEmail(otp, SIGNUP_OTP_EXPIRY_MINUTES),
  })

  if (!result.sent) {
    if (result.reason === 'not_configured') {
      console.warn(`Resend not configured — signup OTP for ${email}: ${otp}`)
    }
    return result
  }

  return result
}

module.exports = {
  sendOrderConfirmationEmail,
  sendVendorOrderEmail,
  sendSignupOtpEmail,   // handles both SIGNUP and PASSWORD_RESET via purpose param
  SIGNUP_OTP_EXPIRY_MINUTES,
}
