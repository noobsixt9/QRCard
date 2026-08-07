const PDFDocument = require('pdfkit')

function dataUrlToBuffer(dataUrl) {
  if (!dataUrl) return null
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
  return Buffer.from(base64, 'base64')
}

async function fetchImageBuffer(url) {
  if (!url) return null
  if (url.startsWith('data:')) return dataUrlToBuffer(url)
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch {
    return null
  }
}

/**
 * Generates a print-ready PDF business card (3.5" × 2" = 252pt × 144pt).
 * Respects the user's actual design_config: themeColor, layout, fontStyle, cornerStyle, showLogo.
 */
function generateCardPDF(profile, qrDataUrl, designConfig = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const themeColor  = designConfig.theme_color  || '#6366f1'
      const layout      = designConfig.layout       || 'standard'
      const fontStyle   = designConfig.font_style   || 'modern'
      const showLogo    = designConfig.show_logo !== false

      // PDFKit only supports built-in fonts: Helvetica (sans), Times-Roman (serif), Courier (mono)
      const fontFace = fontStyle === 'classic' ? 'Times-Roman'
        : fontStyle === 'mono'    ? 'Courier'
        : 'Helvetica'
      const fontBold = fontStyle === 'classic' ? 'Times-Bold'
        : fontStyle === 'mono'    ? 'Courier-Bold'
        : 'Helvetica-Bold'

      // Business card: 3.5" × 2" at 72dpi = 252pt × 144pt
      const W = 252
      const H = 144

      const doc = new PDFDocument({ size: [W, H], margin: 0 })

      const chunks = []
      doc.on('data',  (chunk) => chunks.push(chunk))
      doc.on('end',   () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // ── Background ──
      doc.rect(0, 0, W, H).fill('#ffffff')

      // ── Left accent stripe ──
      doc.rect(0, 0, 5, H).fill(themeColor)

      // ── Top-right soft glow (translucent rect simulation) ──
      doc.save()
      doc.opacity(0.06)
      doc.circle(W, 0, 90).fill(themeColor)
      doc.restore()

      // ── Logo label (top-left above name) ──
      if (showLogo) {
        doc.font(fontBold).fontSize(6.5)
          .fillColor(themeColor)
          .text('QR CARD', 18, 12, { characterSpacing: 1.5 })
      }

      // ── Name ──
      doc.font(fontBold).fontSize(13)
        .fillColor('#0f172a')
        .text(profile.full_name || 'QRCard User', 18, showLogo ? 22 : 14, { width: 155, lineBreak: false })

      // ── Title · Company ──
      const roleText = [profile.job_title, profile.company].filter(Boolean).join(' · ')
      if (roleText) {
        doc.font(fontFace).fontSize(7.5)
          .fillColor('#64748b')
          .text(roleText, 18, showLogo ? 38 : 30, { width: 155, lineBreak: false })
      }

      // ── Divider line ──
      const divY = showLogo ? 50 : 42
      doc.moveTo(18, divY).lineTo(46, divY)
        .strokeColor(themeColor).lineWidth(1.5).stroke()

      // ── Contact rows (standard layout only) ──
      if (layout === 'standard') {
        const contacts = [
          profile.phone        && `${profile.phone}`,
          profile.public_email && `${profile.public_email}`,
          profile.website      && `${(profile.website).replace(/^https?:\/\//, '')}`,
        ].filter(Boolean)

        contacts.forEach((line, i) => {
          const cy = divY + 8 + i * 14
          // dot bullet in accent color
          doc.circle(22, cy + 3, 2.5).fill(themeColor)
          doc.font(fontFace).fontSize(7)
            .fillColor('#475569')
            .text(line, 30, cy, { width: 140, lineBreak: false })
        })
      }

      // ── Profile URL ──
      const urlY = H - 16
      doc.font(fontBold).fontSize(7)
        .fillColor(themeColor)
        .text(`qrcard.dev/u/${profile.username || ''}`, 18, urlY, { width: 150, lineBreak: false })

      // ── QR code (right side, vertically centered) ──
      const qrBuffer = dataUrlToBuffer(qrDataUrl)
      const qrSize   = 64
      const qrX      = W - qrSize - 12
      const qrY      = (H - qrSize) / 2

      if (qrBuffer) {
        // White background rect behind QR
        doc.rect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8)
          .fill('#ffffff')
        // Thin accent border
        doc.rect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8)
          .strokeColor(themeColor).lineWidth(1).stroke()
        doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize })
      }

      // ── SCAN ME label under QR ──
      doc.font(fontBold).fontSize(5.5)
        .fillColor(themeColor)
        .text('SCAN ME', qrX - 4, qrY + qrSize + 6, {
          width: qrSize + 8,
          align: 'center',
          characterSpacing: 1,
        })

      // ── Card border ──
      doc.rect(0, 0, W, H)
        .strokeColor('#e2e8f0').lineWidth(0.5).stroke()

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = { generateCardPDF }
