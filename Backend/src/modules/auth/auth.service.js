const prisma = require('../../config/db')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { sanitizeUser, slugify } = require('../../utils/user')
const { signToken } = require('../../utils/jwt')

async function generateUniqueUsername(baseName) {
  let base = slugify(baseName) || 'user'
  if (base.length < 3) base = `${base}_user`

  let username = base.slice(0, 20)
  let exists = await prisma.user.findUnique({ where: { username } })
  let attempt = 0

  while (exists) {
    attempt += 1
    const suffix = `_${Math.floor(Math.random() * 10000)}`
    username = `${base.slice(0, 20 - suffix.length)}${suffix}`
    exists = await prisma.user.findUnique({ where: { username } })
    if (attempt > 20) {
      username = `user_${Date.now()}`
      break
    }
  }

  return username
}

async function syncUser(firebase, { username }) {
  const { uid, email, name, picture } = firebase

  if (!email) {
    const err = new Error('Firebase account must have an email address')
    err.status = 400
    throw err
  }

  const existing = await prisma.user.findUnique({ where: { firebase_uid: uid } })
  if (existing) {
    return { user: sanitizeUser(existing), is_new: false }
  }

  const emailTaken = await prisma.user.findUnique({ where: { email } })
  if (emailTaken) {
    if (emailTaken.firebase_uid && emailTaken.firebase_uid !== uid) {
      const err = new Error('This email is already linked with another social account')
      err.status = 409
      throw err
    }

    const linked = await prisma.user.update({
      where: { id: emailTaken.id },
      data: { firebase_uid: uid },
    })
    return { user: sanitizeUser(linked), is_new: false, linked: true }
  }

  const usernameTaken = await prisma.user.findUnique({ where: { username } })
  if (usernameTaken) {
    const err = new Error('Username already taken')
    err.status = 409
    throw err
  }

  const user = await prisma.user.create({
    data: {
      firebase_uid: uid,
      email,
      username,
      role: 'USER',
      profile: {
        create: {
          full_name: name || null,
          avatar_url: picture || null,
        },
      },
    },
  })

  return { user: sanitizeUser(user), is_new: true }
}

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
    const err = new Error('This account uses social sign-in. Continue with Firebase OAuth.')
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

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { reset_token: null }
  }

  const token = crypto.randomBytes(24).toString('hex')
  const expires = new Date(Date.now() + 1000 * 60 * 30)

  await prisma.user.update({
    where: { id: user.id },
    data: { reset_token: token, reset_expires: expires },
  })

  return { reset_token: token, expires_at: expires.toISOString() }
}

async function resetPassword(token, password) {
  const user = await prisma.user.findFirst({
    where: {
      reset_token: token,
      reset_expires: { gt: new Date() },
    },
  })

  if (!user) {
    const err = new Error('Invalid or expired reset token')
    err.status = 400
    throw err
  }

  const password_hash = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password_hash,
      reset_token: null,
      reset_expires: null,
    },
  })
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

  return sanitizeUser(user)
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  syncUser,
  getMe,
  generateUniqueUsername,
}
