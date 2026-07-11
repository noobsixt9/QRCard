const express = require('express')
const auth = require('../../middleware/auth')
const requireUser = require('../../middleware/requireUser')
const requireRole = require('../../middleware/requireRole')
const validate = require('../../middleware/validate')
const verifyRecaptcha = require('../../middleware/verifyRecaptcha')
const { authLimiter } = require('../../middleware/rateLimiter')
const {
  registerSchema,
  verifySignupOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  syncSchema,
} = require('./auth.schema')
const authController = require('./auth.controller')

const router = express.Router()

router.post(
  '/register/request-otp',
  authLimiter,
  validate(registerSchema),
  verifyRecaptcha('SIGNUP'),
  authController.requestSignupOtp
)
router.post(
  '/register/verify-otp',
  authLimiter,
  validate(verifySignupOtpSchema),
  authController.verifySignupOtp
)
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  verifyRecaptcha('LOGIN'),
  authController.login
)
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  verifyRecaptcha('FORGOT_PASSWORD'),
  authController.forgotPassword
)
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
)
router.post('/sync', authLimiter, auth, validate(syncSchema), authController.sync)
router.get('/me', auth, requireUser, requireRole('USER', 'ADMIN'), authController.me)

module.exports = router
