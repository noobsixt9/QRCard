const express = require('express')
const auth = require('../../middleware/auth')
const requireRole = require('../../middleware/requireRole')
const validate = require('../../middleware/validate')
const {
  createVendorSchema,
  updateVendorSchema,
  assignVendorSchema,
} = require('../vendor/vendor.schema')
const adminController = require('./admin.controller')

const router = express.Router()

router.use(auth, requireRole('ADMIN'))

router.get('/dashboard', adminController.dashboard)

router.get('/orders', adminController.listOrders)
router.get('/orders/:id', adminController.getOrder)
router.patch('/orders/:id/status', adminController.updateOrderStatus)
router.post(
  '/orders/:id/send-to-vendor',
  validate(assignVendorSchema),
  adminController.sendToVendor
)

router.get('/users', adminController.listUsers)
router.get('/users/:id', adminController.getUser)
router.patch('/users/:id/status', adminController.updateUserStatus)

router.post('/vendors', validate(createVendorSchema), adminController.createVendor)
router.get('/vendors', adminController.listVendors)
router.get('/vendors/:id', adminController.getVendor)
router.put('/vendors/:id', validate(updateVendorSchema), adminController.updateVendor)
router.delete('/vendors/:id', adminController.deleteVendor)

module.exports = router
