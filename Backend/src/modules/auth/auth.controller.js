const authService = require('./auth.service')

async function requestSignupOtp(req, res, next) {
  try {
    const result = await authService.requestSignupOtp(req.body)
    res.status(200).json({
      success: true,
      message: 'Verification code sent. Check your email to complete signup.',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

async function verifySignupOtp(req, res, next) {
  try {
    const result = await authService.verifySignupOtp(req.body)
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

async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body.email)
    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset token has been generated',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.body.token, req.body.password)
    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    })
  } catch (err) {
    next(err)
  }
}

async function sync(req, res, next) {
  try {
    if (req.user) {
      const user = await authService.getMe(req.user.id)
      return res.status(200).json({
        success: true,
        message: 'Account already synced',
        data: { user, is_new: false },
      })
    }

    const result = await authService.syncUser(req.firebase, req.body)
    res.status(201).json({
      success: true,
      message: 'Account synced successfully',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}

async function me(req, res, next) {
  try {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'Account not synced. Call POST /api/auth/sync first.',
        needs_sync: true,
      })
    }

    const user = await authService.getMe(req.user.id)
    res.status(200).json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

async function googleLogin(req, res, next) {
  try {
    const result = await authService.googleLogin(req.body.credential)
    res.status(200).json({ success: true, message: 'Google login successful', data: result })
  } catch (err) { next(err) }
}

async function googleCheck(req, res, next) {
  try {
    const { email } = req.body
    const user = email ? await require('../../config/db').user.findFirst({ where: { email } }) : null
    res.status(200).json({ success: true, data: { exists: !!user, hasPassword: !!(user?.password_hash) } })
  } catch (err) { next(err) }
}

async function verifyOTP(req, res, next) {
  try {
    const result = await authService.verifyOTP(req.body)
    // For PASSWORD_RESET, result contains { reset_token } — pass it back
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: result || {},
    })
  } catch (err) { next(err) }
}

async function resendOTP(req, res, next) {
  try {
    await authService.sendOTP(req.body.email, req.body.purpose || 'REGISTRATION')
    res.status(200).json({ success: true, message: 'OTP resent successfully' })
  } catch (err) { next(err) }
}

async function changePassword(req, res, next) {
  try {
    const bcrypt = require('bcrypt')
    const db = require('../../config/db')
    const user = await db.user.findUnique({ where: { id: req.user.id } })
    if (!user?.password_hash) return res.status(400).json({ success: false, message: 'This account uses Google login.' })
    const match = await bcrypt.compare(req.body.current_password, user.password_hash)
    if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect.' })
    const hash = await bcrypt.hash(req.body.new_password, 12)
    await db.user.update({ where: { id: req.user.id }, data: { password_hash: hash } })
    res.status(200).json({ success: true, message: 'Password changed successfully' })
  } catch (err) { next(err) }
}

module.exports = {
  requestSignupOtp,
  verifySignupOtp,
  login,
  forgotPassword,
  resetPassword,
  sync,
  me,
  googleLogin,
  googleCheck,
  verifyOTP,
  resendOTP,
  changePassword,
}
