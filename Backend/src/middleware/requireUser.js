function requireUser(req, res, next) {
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: 'Account not synced. Call POST /api/auth/sync first.',
      needs_sync: true,
    })
  }
  next()
}

module.exports = requireUser
