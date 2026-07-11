const { z } = require('zod')

const recaptchaTokenField = {
  recaptchaToken: z.string().min(1, 'reCAPTCHA verification is required').optional(),
}

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  ...recaptchaTokenField,
})

const verifySignupOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z
    .string()
    .regex(/^\d{6}$/, 'OTP must be a 6-digit code'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  ...recaptchaTokenField,
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  ...recaptchaTokenField,
})

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const syncSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
})

module.exports = {
  registerSchema,
  verifySignupOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  syncSchema,
}
