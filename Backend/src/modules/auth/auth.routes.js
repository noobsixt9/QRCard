const express = require('express')
const auth = require('../../middleware/auth')
const requireUser = require('../../middleware/requireUser')
const requireRole = require('../../middleware/requireRole')
const validate = require('../../middleware/validate')
const { authLimiter } = require('../../middleware/rateLimiter')
const { syncSchema } = require('./auth.schema')
const authController = require('./auth.controller')

const router = express.Router()

router.post('/sync', authLimiter, auth, validate(syncSchema), authController.sync)
router.get('/me', auth, requireUser, requireRole('USER', 'ADMIN'), authController.me)

module.exports = router
