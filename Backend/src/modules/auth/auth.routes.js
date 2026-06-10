const express = require('express')
const auth = require('../../middleware/auth')
const validate = require('../../middleware/validate')
const requireRole = require('../../middleware/requireRole')
const { authLimiter } = require('../../middleware/rateLimiter')
const { registerSchema, loginSchema } = require('./auth.schema')
const authController = require('./auth.controller')

const router = express.Router()

router.post('/register', authLimiter, validate(registerSchema), authController.register)
router.post('/login', authLimiter, validate(loginSchema), authController.login)
router.get('/me', auth, requireRole('USER', 'ADMIN'), authController.me)
router.get('/google', authController.googleAuth)
router.get('/google/callback', authController.googleCallback)

module.exports = router
