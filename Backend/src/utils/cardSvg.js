/**
 * Generates a print-ready SVG business card (3.5" × 2" at 96 dpi = 336 × 192 px).
 * Returned as a UTF-8 string suitable for email attachment.
 */

function escapeXml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function truncate(str, max) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

/**
 * @param {object} profile  - user profile fields
 * @param {string|null} qrDataUrl - base64 PNG data URL for the QR code
 * @param {object} designConfig  - design options from the order
 * @returns {string} SVG markup
 */
function generateCardSvg(profile, qrDataUrl, designConfig = {}) {
  const W = 336   // 3.5" × 96dpi
  const H = 192   // 2"   × 96dpi

  const themeColor  = designConfig.theme_color  || '#6366f1'
  const cornerStyle = designConfig.corner_style || 'rounded'
  const fontStyle   = designConfig.font_style   || 'modern'
  const layout      = designConfig.layout       || 'standard'
  const showLogo    = designConfig.show_logo !== false

  const cornerRadius = cornerStyle === 'sharp' ? 0 : 10
  const fontFamily   = fontStyle === 'classic' ? 'Georgia, serif'
    : fontStyle === 'mono'    ? "'Courier New', monospace"
    : 'Inter, Arial, sans-serif'

  const name     = truncate(profile.full_name    || 'QRCard User', 30)
  const title    = truncate(profile.job_title    || '', 36)
  const company  = truncate(profile.company      || '', 36)
  const phone    = truncate(profile.phone        || '', 28)
  const email    = truncate(profile.public_email || '', 34)
  const website  = truncate((profile.website     || '').replace(/^https?:\/\//, ''), 32)
  const username = truncate(profile.username     || '', 24)

  const roleText = [title, company].filter(Boolean).join(' · ')

  // QR image block — only if we have a data URL
  const qrImg = qrDataUrl
    ? `<image x="246" y="52" width="76" height="76" href="${qrDataUrl}" preserveAspectRatio="xMidYMid meet"/>`
    : `<!-- no QR -->`

  // Contact rows (layout === standard only)
  const contactRows = []
  if (layout === 'standard') {
    if (phone)   contactRows.push(phone)
    if (email)   contactRows.push(email)
    if (website) contactRows.push(website)
  }

  const contactSvg = contactRows
    .map((row, i) => `
      <circle cx="20" cy="${106 + i * 16}" r="3" fill="${themeColor}" opacity="0.7"/>
      <text x="28" y="${110 + i * 16}" font-family="${fontFamily}" font-size="9" fill="#475569">${escapeXml(row)}</text>`)
    .join('')

  const logoSvg = showLogo
    ? `<text x="20" y="34" font-family="${fontFamily}" font-size="8" font-weight="900"
         letter-spacing="2" fill="${themeColor}" opacity="0.9">QR CARD</text>`
    : ''

  const urlSvg = `<text x="246" y="142" font-family="'Courier New', monospace" font-size="7.5"
    fill="${themeColor}" opacity="0.75" text-anchor="middle">qrcard.dev/u/${escapeXml(username)}</text>`

  const scanLabelSvg = `<text x="246" y="136" font-family="${fontFamily}" font-size="7" font-weight="800"
    letter-spacing="1.5" fill="${themeColor}" text-anchor="middle">SCAN ME</text>`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">

  <!-- Card background -->
  <rect width="${W}" height="${H}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#ffffff"/>

  <!-- Left accent stripe -->
  <rect x="0" y="0" width="5" height="${H}" rx="${cornerRadius}" ry="0" fill="${themeColor}"/>

  <!-- Top-right soft glow -->
  <defs>
    <radialGradient id="glow" cx="85%" cy="10%" r="45%">
      <stop offset="0%" stop-color="${themeColor}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${themeColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" rx="${cornerRadius}" fill="url(#glow)"/>

  <!-- QR divider line -->
  <line x1="226" y1="52" x2="226" y2="142" stroke="#e2e8f0" stroke-width="1"/>

  <!-- Logo -->
  ${logoSvg}

  <!-- Name -->
  <text x="20" y="56" font-family="${fontFamily}" font-size="18" font-weight="800"
    fill="#0f172a" letter-spacing="-0.5">${escapeXml(name)}</text>

  <!-- Title · Company -->
  ${roleText ? `<text x="20" y="70" font-family="${fontFamily}" font-size="9" fill="#64748b">${escapeXml(roleText)}</text>` : ''}

  <!-- Divider -->
  <rect x="20" y="80" width="28" height="2" rx="1" fill="${themeColor}"/>

  <!-- Contact rows -->
  ${contactSvg}

  <!-- QR code image -->
  ${qrImg}

  <!-- Scan label + URL -->
  ${scanLabelSvg}
  ${urlSvg}

  <!-- Card border -->
  <rect width="${W}" height="${H}" rx="${cornerRadius}" ry="${cornerRadius}"
    fill="none" stroke="#e2e8f0" stroke-width="1"/>
</svg>`
}

module.exports = { generateCardSvg }
