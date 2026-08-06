const prisma = require('../config/db')
const { getAuth } = require('../config/firebase')
const { verifyToken } = require('../utils/jwt')

async function attachUserById(req, res, next, userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
}

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
    const jwtPayload = verifyToken(token)
    if (jwtPayload?.type === 'app' && jwtPayload?.id) {
      return attachUserById(req, res, next, jwtPayload.id)
    }
  } catch (_err) {
    // Not an app JWT. Try Firebase ID token next.
  }

  const firebaseAuth = getAuth()
  if (!firebaseAuth) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(token)

    req.firebase = {
      uid: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || null,
      picture: decoded.picture || null,
    }

    const user = await prisma.user.findUnique({
      where: { firebase_uid: decoded.uid },
      select: { id: true, username: true, role: true, is_active: true },
    })

    if (user) {
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
    }

    return next()
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ success: false, message: 'Token has expired' })
    }
    return res.status(401).json({ success: false, message: 'Invalid Firebase token' })
  }
}

module.exports = auth
