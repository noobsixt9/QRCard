const prisma = require('../../config/db')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { sanitizeUser, slugify } = require('../../utils/user')
const { signToken } = require('../../utils/jwt')
const {
  sendSignupOtpEmail,
  SIGNUP_OTP_EXPIRY_MINUTES,
} = require('../../utils/mailService')

const OTP_EXPIRY_MINUTES = SIGNUP_OTP_EXPIRY_MINUTES

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000))
}

function getOtpExpiry(minutes = OTP_EXPIRY_MINUTES) {
  return new Date(Date.now() + 1000 * 60 * minutes)
}

async function assertSignupCredentialsAvailable({ email, username }) {
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
}

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

  const emailTaken = await prisma.user.findFirst({ where: { email } })
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

async function requestSignupOtp({ email, username, password }) {
  await assertSignupCredentialsAvailable({ email, username })

  const password_hash = await bcrypt.hash(password, 12)
  const otp = generateOtp()
  const otp_hash = await bcrypt.hash(otp, 10)
  const otp_expires = getOtpExpiry()

  await prisma.signupVerification.upsert({
    where: { email },
    update: {
      username,
      password_hash,
      otp_hash,
      otp_expires,
    },
    create: {
      email,
      username,
      password_hash,
      otp_hash,
      otp_expires,
    },
  })

  const mailResult = await sendSignupOtpEmail(email, otp)

  const data = {
    email,
    expires_at: otp_expires.toISOString(),
    email_sent: mailResult.sent === true,
  }

  if (!mailResult.sent && mailResult.reason && mailResult.reason !== 'not_configured') {
    data.email_error = mailResult.reason
  }

  if (process.env.NODE_ENV === 'development') {
    data.otp = otp
  }

  return data
}

async function verifySignupOtp({ email, otp }) {
  const pending = await prisma.signupVerification.findUnique({ where: { email } })

  if (!pending || pending.otp_expires <= new Date()) {
    if (pending) {
      await prisma.signupVerification.delete({ where: { email } }).catch(() => {})
    }
    const err = new Error('Invalid or expired OTP')
    err.status = 400
    throw err
  }

  const validOtp = await bcrypt.compare(otp, pending.otp_hash)
  if (!validOtp) {
    const err = new Error('Invalid or expired OTP')
    err.status = 400
    throw err
  }

  await assertSignupCredentialsAvailable({
    email: pending.email,
    username: pending.username,
  })

  const user = await prisma.user.create({
    data: {
      email: pending.email,
      username: pending.username,
      password_hash: pending.password_hash,
      role: 'USER',
      is_verified: false,
      profile: { create: {} },
    },
  })

  await prisma.signupVerification.delete({ where: { email } })

  const token = signToken(user)
  return { token, user: sanitizeUser(user) }
}

async function login({ email, password }) {
  // Check if there are users registered under this email
  let users = await prisma.user.findMany({ where: { email } })

  // If none found, check if it matches a unique username!
  if (users.length === 0) {
    const userByUsername = await prisma.user.findUnique({ where: { username: email } })
    if (userByUsername) {
      users = [userByUsername]
    }
  }

  if (users.length === 0) {
    const err = new Error('Invalid email/username or password')
    err.status = 401
    throw err
  }

  // Find the matched user account by comparing passwords
  let matchedUser = null
  for (const user of users) {
    if (user.password_hash) {
      const isMatch = await bcrypt.compare(password, user.password_hash)
      if (isMatch) {
        matchedUser = user
        break
      }
    }
  }

  if (!matchedUser) {
    const err = new Error('Invalid email/username or password')
    err.status = 401
    throw err
  }

  if (!matchedUser.is_verified) {
    // Send registration OTP
    await sendOTP(matchedUser.email, 'REGISTRATION')
    const err = new Error('Email not verified. A verification OTP has been sent to your email.')
    err.status = 403
    throw err
  }

  const token = signToken(matchedUser)
  return { token, user: sanitizeUser(matchedUser) }
}

async function forgotPassword(email) {
  const user = await prisma.user.findFirst({ where: { email } })
  if (!user) {
    // Silent return for security to prevent email enumeration
    return { email }
  }

  // Send reset OTP
  await sendOTP(email, 'PASSWORD_RESET')
  return { email }
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
  await prisma.user.updateMany({
    where: { reset_token: token },
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
  requestSignupOtp,
  verifySignupOtp,
  login,
  forgotPassword,
  resetPassword,
  syncUser,
  getMe,
  generateUniqueUsername,
  verifyOTP,
  sendOTP,
  googleLogin,
}

async function googleLogin(credential) {
  let email, name, picture
  
  if (process.env.NODE_ENV === 'development' && credential === 'dev_mode_bypass_token') {
    email = 'google_tester@qrcard.com'
    name = 'Google Tester'
    picture = null
  } else {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
    if (!response.ok) {
      const err = new Error('Invalid Google credential token')
      err.status = 400
      throw err
    }

    const data = await response.json()
    email = data.email
    name = data.name
    picture = data.picture
  }

  if (!email) {
    const err = new Error('Google account must have an email address')
    err.status = 400
    throw err
  }

  let user = await prisma.user.findFirst({ where: { email } })

  if (!user) {
    const baseName = name || email.split('@')[0]
    const username = await generateUniqueUsername(baseName)

    user = await prisma.user.create({
      data: {
        email,
        username,
        role: 'USER',
        is_verified: true,
        profile: {
          create: {
            full_name: name || null,
            avatar_url: picture || null,
          },
        },
      },
    })
  }

  if (!user.is_active) {
    const err = new Error('Account has been deactivated')
    err.status = 403
    throw err
  }

  const token = signToken(user)
  return { token, user: sanitizeUser(user) }
}

