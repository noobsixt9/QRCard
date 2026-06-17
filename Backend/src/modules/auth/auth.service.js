const prisma = require('../../config/db')
const { sanitizeUser, slugify } = require('../../utils/user')

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
    const err = new Error('An account with this email already exists')
    err.status = 409
    throw err
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

module.exports = { syncUser, getMe, generateUniqueUsername }
