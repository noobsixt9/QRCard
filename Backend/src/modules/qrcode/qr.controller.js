const qrService = require('./qr.service')
const prisma = require('../../config/db')

async function createOnline(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const data = await qrService.generateOnlineQR(req.user.id, user.username)
    res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

async function createOffline(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    const data = await qrService.generateOfflineQR(req.user.id, user.username)
    res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

async function getAll(req, res, next) {
  try {
    const data = await qrService.getUserQRCodes(req.user.id)
    res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

async function remove(req, res, next) {
  try {
    const type = req.params.type.toUpperCase()
    if (!['ONLINE', 'OFFLINE'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be ONLINE or OFFLINE',
      })
    }
    await qrService.deleteQR(req.user.id, type)
    res.status(200).json({ success: true, message: 'QR code deleted successfully' })
  } catch (err) {
    next(err)
  }
}

module.exports = { createOnline, createOffline, getAll, remove }
