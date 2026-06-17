const jwt = require('jsonwebtoken')

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, type: 'app' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { signToken, verifyToken }
