const jwt = require('jsonwebtoken')
const prisma = require('../config/db')

async function auth(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token required',
    })
  }

  const token = header.slice(7)

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, username: true, role: true, is_active: true },
    })

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated',
      })
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    }

    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired' })
    }
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

module.exports = auth
