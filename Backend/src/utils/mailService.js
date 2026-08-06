const { getResend } = require('../config/mailer')
const { orderReceiptEmail, vendorOrderEmail, signupOtpEmail } = require('./emailTemplates')

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

async function sendVendorOrderEmail(order, user, vendor, pdfBuffer) {
  const result = await sendEmail({
    to: vendor.email,
    subject: `QRCard Print Order #${order.id}`,
    html: vendorOrderEmail(order, user, vendor),
    attachments: [{ filename: `order-${order.id}.pdf`, content: pdfBuffer }],
  })

  if (!result.sent && result.reason === 'not_configured') {
    console.warn('Resend not configured — skipping vendor email')
  }
}

async function sendSignupOtpEmail(email, otp) {
  const result = await sendEmail({
    to: email,
    subject: 'Your QRCard signup verification code',
    html: signupOtpEmail(otp, SIGNUP_OTP_EXPIRY_MINUTES),
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
  sendSignupOtpEmail,
  SIGNUP_OTP_EXPIRY_MINUTES,
}
