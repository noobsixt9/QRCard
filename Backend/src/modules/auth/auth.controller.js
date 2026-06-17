const authService = require('./auth.service')

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

module.exports = { sync, me }
