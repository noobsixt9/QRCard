const bcrypt = require('bcrypt')
const prisma = require('../../config/db')
const { signToken, sanitizeUser } = require('../../utils/jwt')

async function register({ email, username, password }) {
  const existingEmail = await prisma.user.findUnique({ where: { email } })
  if (existingEmail) {
    const err = new Error('Email already taken')
    err.status = 409
    throw err
  }

  const existingUsername = await prisma.user.findUnique({ where: { username } })
  if (existingUsername) {
    const err = new Error('Username already taken')
    err.status = 409
    throw err
  }

  const password_hash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password_hash,
      role: 'USER',
      profile: { create: {} },
    },
  })

  const token = signToken(user)
  return { token, user: sanitizeUser(user) }
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    const err = new Error('Invalid email or password')
    err.status = 401
    throw err
  }

  if (!user.password_hash) {
    const err = new Error('Please sign in with Google')
    err.status = 400
    throw err
  }

  if (!user.is_active) {
    const err = new Error('Account has been deactivated')
    err.status = 403
    throw err
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    const err = new Error('Invalid email or password')
    err.status = 401
    throw err
  }

  const token = signToken(user)
  return { token, user: sanitizeUser(user) }
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      is_active: true,
    },
  })

  if (!user || !user.is_active) {
    const err = new Error('Account has been deactivated')
    err.status = 403
    throw err
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  }
}

module.exports = { register, login, getMe }
