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
  verifyOtpSchema,
  resendOtpSchema,
} = require('./auth.schema')
const authController = require('./auth.controller')

const router = express.Router()

router.post(
  '/register/request-otp',
  authLimiter,
  validate(registerSchema),
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
  authController.login
)
router.post('/google', authLimiter, authController.googleLogin)
router.post('/google-check', authLimiter, authController.googleCheck)
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
)
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
)
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), authController.verifyOTP)
router.post('/resend-otp', authLimiter, validate(resendOtpSchema), authController.resendOTP)
router.post('/sync', authLimiter, auth, validate(syncSchema), authController.sync)
router.get('/me', auth, requireUser, requireRole('USER', 'ADMIN'), authController.me)

module.exports = router
