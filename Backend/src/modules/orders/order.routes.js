const express = require('express')
const auth = require('../../middleware/auth')
const requireRole = require('../../middleware/requireRole')
const validate = require('../../middleware/validate')
const { createOrderSchema } = require('./order.schema')
const orderController = require('./order.controller')

const router = express.Router()

router.use(auth, requireRole('USER', 'ADMIN'))

router.post('/', validate(createOrderSchema), orderController.create)
router.get('/', orderController.list)
router.get('/:id', orderController.getOne)
router.patch('/:id/cancel', orderController.cancel)

module.exports = router
