const authService = require('./auth.service')

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

module.exports = { register, login, forgotPassword, resetPassword, sync, me }
