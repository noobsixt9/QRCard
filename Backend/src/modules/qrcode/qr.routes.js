const express = require('express')
const auth = require('../../middleware/auth')
const requireRole = require('../../middleware/requireRole')
const qrController = require('./qr.controller')

const router = express.Router()

router.post('/online', auth, requireRole('USER', 'ADMIN'), qrController.createOnline)
router.post('/offline', auth, requireRole('USER', 'ADMIN'), qrController.createOffline)
router.get('/', auth, requireRole('USER', 'ADMIN'), qrController.getAll)
router.delete('/:type', auth, requireRole('USER', 'ADMIN'), qrController.remove)

module.exports = router
