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

function generateCardPDF(profile, qrDataUrl, designConfig = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const primaryColor = designConfig.primary_color || '#1a1a2e'
      const secondaryColor = designConfig.secondary_color || '#ffffff'
      const showAvatar = designConfig.show_avatar !== false

      const doc = new PDFDocument({
        size: [241, 153],
        margin: 10,
      })

      const chunks = []
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      doc.rect(0, 0, 241, 153).fill(primaryColor)

      doc.fillColor(secondaryColor)
        .fontSize(14)
        .text(profile.full_name || 'QRCard User', 15, 20, { width: 140 })

      doc.fontSize(9)
        .text(profile.job_title || '', 15, 40, { width: 140 })
        .text(profile.company || '', 15, 52, { width: 140 })

      if (profile.phone) doc.text(profile.phone, 15, 70, { width: 140 })
      if (profile.public_email) doc.text(profile.public_email, 15, 82, { width: 140 })
      if (profile.website) doc.text(profile.website, 15, 94, { width: 140 })

      const qrBuffer = dataUrlToBuffer(qrDataUrl)
      if (qrBuffer) {
        doc.image(qrBuffer, 175, 35, { width: 55, height: 55 })
      }

      if (showAvatar && profile.avatar_url) {
        const avatarBuffer = await fetchImageBuffer(profile.avatar_url)
        if (avatarBuffer) {
          doc.image(avatarBuffer, 15, 108, { width: 30, height: 30 })
        }
      }

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = { generateCardPDF }
