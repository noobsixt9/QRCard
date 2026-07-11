const { getResend } = require('../config/mailer')
const { orderReceiptEmail, vendorOrderEmail, otpEmailTemplate } = require('./emailTemplates')

async function sendOrderConfirmationEmail(order, user, pdfBuffer) {
  const resend = getResend()
  if (!resend) {
    console.warn('Resend not configured — skipping confirmation email')
    return
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@qrcard.com',
    to: user.email,
    subject: `QRCard Order Confirmed #${order.id}`,
    html: orderReceiptEmail(order, user),
    attachments: pdfBuffer
      ? [{ filename: `order-${order.id}.pdf`, content: pdfBuffer }]
      : undefined,
  })
}

async function sendVendorOrderEmail(order, user, vendor, pdfBuffer) {
  const resend = getResend()
  if (!resend) {
    console.warn('Resend not configured — skipping vendor email')
    return
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@qrcard.com',
    to: vendor.email,
    subject: `QRCard Print Order #${order.id}`,
    html: vendorOrderEmail(order, user, vendor),
    attachments: [{ filename: `order-${order.id}.pdf`, content: pdfBuffer }],
  })
}

async function sendOtpEmail(email, code, purpose) {
  // Always log OTP in development mode for easy bypass/testing
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n==================================================`);
    console.log(`🔑 [DEV MODE] OTP code for ${email} is: ${code}`);
    console.log(`==================================================\n`);
  }

  const resend = getResend()
  if (!resend) {
    console.warn(`Resend not configured — OTP code for ${email} is: ${code}`)
    return
  }

  const subjectText = purpose === 'REGISTRATION' ? 'Email Verification OTP' : 'Password Reset OTP';

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@qrcard.com',
      to: email,
      subject: `QRCard - ${subjectText}`,
      html: otpEmailTemplate(code, purpose),
    })
  } catch (error) {
    console.error(`Resend API error sending OTP to ${email}:`, error);
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚠️ Email sending failed, but you can use the OTP code above in development mode.`);
    } else {
      throw error;
    }
  }
}

module.exports = { sendOrderConfirmationEmail, sendVendorOrderEmail, sendOtpEmail }
