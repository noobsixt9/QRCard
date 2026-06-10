const authService = require('./auth.service')
const { signToken } = require('../../utils/jwt')

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body)
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id)
    res.status(200).json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

function googleNotConfigured(res) {
  return res.status(503).json({
    success: false,
    message: 'Google OAuth is not configured',
  })
}

function googleAuth(req, res, next) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return googleNotConfigured(res)
  }
  const passport = require('../../config/passport')
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next)
}

function googleCallback(req, res, next) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return googleNotConfigured(res)
  }
  const passport = require('../../config/passport')

  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      const clientUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000'
      return res.redirect(`${clientUrl}/auth/error?message=oauth_failed`)
    }

    if (!user.is_active) {
      const clientUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000'
      return res.redirect(`${clientUrl}/auth/error?message=account_deactivated`)
    }

    const token = signToken(user)
    const clientUrl = process.env.CLIENT_BASE_URL || 'http://localhost:3000'
    return res.redirect(`${clientUrl}/auth/callback?token=${token}`)
  })(req, res, next)
}

module.exports = { register, login, me, googleAuth, googleCallback }
