const jwt = require('jsonwebtoken')

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  }
}

module.exports = { signToken, sanitizeUser }
