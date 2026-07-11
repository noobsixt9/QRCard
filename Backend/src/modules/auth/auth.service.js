const prisma = require('../../config/db')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { sanitizeUser, slugify } = require('../../utils/user')
const { signToken } = require('../../utils/jwt')
const { sendOtpEmail } = require('../../utils/mailService')

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

async function sendOTP(email, purpose) {
  // Generate a random 6-digit numeric OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10) // 10 minutes from now

  // Delete any existing OTP for this email and purpose to keep table clean
  await prisma.oTP.deleteMany({
    where: { email, purpose },
  })

  // Create new OTP
  await prisma.oTP.create({
    data: {
      email,
      code,
      purpose,
      expires_at: expiresAt,
    },
  })

  // Send the OTP email
  await sendOtpEmail(email, code, purpose)
}

async function verifyRecaptcha(token) {
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  const secret = process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnFTxWfn0AGHO9hhzo75' // Fallback to Google test secret
  try {
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`, {
      method: 'POST',
    })
    const data = await response.json()
    return !!data.success
  } catch (err) {
    console.error('reCAPTCHA validation error:', err)
    return false
  }
}

async function verifyOTP({ email, code, purpose, recaptchaToken }) {
  // 1. Verify reCAPTCHA token
  const isRecaptchaValid = await verifyRecaptcha(recaptchaToken)
  if (!isRecaptchaValid) {
    const err = new Error('Invalid reCAPTCHA verification. Please try again.')
    err.status = 400
    throw err
  }

  // 2. Look up the OTP
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      email,
      code,
      purpose,
      expires_at: { gt: new Date() },
    },
  })

  if (!otpRecord) {
    const err = new Error('Invalid or expired OTP code.')
    err.status = 400
    throw err
  }

  // 3. Delete OTP record as it is verified
  await prisma.oTP.delete({ where: { id: otpRecord.id } })

  // 4. Handle flows depending on purpose
  if (purpose === 'REGISTRATION') {
    // Mark user as verified
    await prisma.user.updateMany({
      where: { email },
      data: { is_verified: true },
    })

    const user = await prisma.user.findFirst({
      where: { email },
      include: { profile: true },
    })

    const token = signToken(user)
    return { token, user: sanitizeUser(user) }
  } else if (purpose === 'PASSWORD_RESET') {
    // Generate a reset token for password reset completion
    const token = crypto.randomBytes(24).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 30) // 30 minutes

    await prisma.user.updateMany({
      where: { email },
      data: { reset_token: token, reset_expires: expires },
    })

    return { reset_token: token }
  }
}

async function register({ email, username, password }) {

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
      is_verified: false,
      profile: { create: {} },
    },
  })

  // Send registration OTP
  await sendOTP(email, 'REGISTRATION')

  return { email, message: 'Registration OTP sent successfully. Please check your email.' }
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
  register,
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

