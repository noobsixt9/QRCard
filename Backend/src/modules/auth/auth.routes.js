const express = require('express')
const auth = require('../../middleware/auth')
const requireUser = require('../../middleware/requireUser')
const requireRole = require('../../middleware/requireRole')
const validate = require('../../middleware/validate')
const verifyRecaptcha = require('../../middleware/verifyRecaptcha')
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

router.post('/register/request-otp', validate(registerSchema), verifyRecaptcha('SIGNUP'), authController.requestSignupOtp)
router.post('/register/verify-otp',  validate(verifySignupOtpSchema), authController.verifySignupOtp)
router.post('/login',                validate(loginSchema), verifyRecaptcha('LOGIN'), authController.login)
router.post('/google',               authController.googleLogin)
router.post('/google-check',         authController.googleCheck)
router.post('/forgot-password',      validate(forgotPasswordSchema), verifyRecaptcha('FORGOT_PASSWORD'), authController.forgotPassword)
router.post('/reset-password',       validate(resetPasswordSchema), authController.resetPassword)
router.post('/verify-otp',           validate(verifyOtpSchema), authController.verifyOTP)
router.post('/resend-otp',           validate(resendOtpSchema), authController.resendOTP)
router.post('/sync',                 auth, validate(syncSchema), authController.sync)
router.get( '/me',                   auth, requireUser, requireRole('USER', 'ADMIN'), authController.me)
router.post('/change-password',      auth, requireUser, authController.changePassword)

module.exports = router
