const QRCode = require('qrcode')
const prisma = require('../../config/db')
const { buildVCard } = require('../../utils/vcard')

const QR_OPTIONS = { width: 300, margin: 2, errorCorrectionLevel: 'M' }

async function generateOnlineQR(userId, username) {
  const url = `${process.env.CLIENT_BASE_URL}/u/${username}`
  const qr_data_url = await QRCode.toDataURL(url, QR_OPTIONS)

  const qr = await prisma.qRCode.upsert({
    where: { user_id_type: { user_id: userId, type: 'ONLINE' } },
    update: { qr_data_url, vcard_content: null },
    create: { user_id: userId, type: 'ONLINE', qr_data_url },
  })

  return {
    type: qr.type,
    qr_data_url: qr.qr_data_url,
    scan_count: qr.scan_count,
    created_at: qr.created_at,
    updated_at: qr.updated_at,
  }
}

async function generateOfflineQR(userId, username) {
  const profile = await prisma.profile.findUnique({ where: { user_id: userId } })
  if (!profile) {
    const err = new Error('Profile not found')
    err.status = 404
    throw err
  }

  const vcard_content = buildVCard(profile, username)
  const qr_data_url = await QRCode.toDataURL(vcard_content, QR_OPTIONS)

  const qr = await prisma.qRCode.upsert({
    where: { user_id_type: { user_id: userId, type: 'OFFLINE' } },
    update: { qr_data_url, vcard_content },
    create: { user_id: userId, type: 'OFFLINE', qr_data_url, vcard_content },
  })

  return {
    type: qr.type,
    qr_data_url: qr.qr_data_url,
    vcard_content: qr.vcard_content,
    created_at: qr.created_at,
    updated_at: qr.updated_at,
  }
}

async function getUserQRCodes(userId) {
  const [profile, codes] = await Promise.all([
    prisma.profile.findUnique({ where: { user_id: userId } }),
    prisma.qRCode.findMany({ where: { user_id: userId } }),
  ])

  const online = codes.find((c) => c.type === 'ONLINE') || null
  const offline = codes.find((c) => c.type === 'OFFLINE') || null

  return {
    profile_updated_at: profile?.updated_at || null,
    online: online
      ? {
          qr_data_url: online.qr_data_url,
          scan_count: online.scan_count,
          created_at: online.created_at,
          updated_at: online.updated_at,
        }
      : null,
    offline: offline
      ? {
          qr_data_url: offline.qr_data_url,
          vcard_content: offline.vcard_content,
          created_at: offline.created_at,
          updated_at: offline.updated_at,
        }
      : null,
  }
}

async function deleteQR(userId, type) {
  const existing = await prisma.qRCode.findUnique({
    where: { user_id_type: { user_id: userId, type } },
  })

  if (!existing) {
    const err = new Error('QR code not found')
    err.status = 404
    throw err
  }

  await prisma.qRCode.delete({
    where: { user_id_type: { user_id: userId, type } },
  })

  return { message: 'QR code deleted successfully' }
}

module.exports = {
  generateOnlineQR,
  generateOfflineQR,
  getUserQRCodes,
  deleteQR,
}
