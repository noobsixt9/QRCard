const { getResend } = require('../config/mailer')
const { orderReceiptEmail, vendorOrderEmail } = require('./emailTemplates')

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

module.exports = { sendOrderConfirmationEmail, sendVendorOrderEmail }
