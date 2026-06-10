const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const prisma = require('./db')

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 15)
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

const googleConfigured =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET

if (googleConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id
        const email = profile.emails?.[0]?.value
        const displayName = profile.displayName || 'User'
        const avatarUrl = profile.photos?.[0]?.value || null

        if (!email) {
          return done(new Error('Google account has no email'))
        }

        let user = await prisma.user.findUnique({ where: { google_id: googleId } })

        if (!user) {
          user = await prisma.user.findUnique({ where: { email } })
          if (user) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { google_id: googleId },
            })
          }
        }

        if (!user) {
          const username = await generateUniqueUsername(displayName)
          user = await prisma.user.create({
            data: {
              email,
              username,
              google_id: googleId,
              password_hash: null,
              role: 'USER',
              profile: {
                create: {
                  full_name: displayName,
                  avatar_url: avatarUrl,
                },
              },
            },
          })
        } else {
          const existingProfile = await prisma.profile.findUnique({
            where: { user_id: user.id },
          })

          const profileUpdate = {}
          if (!existingProfile?.full_name) profileUpdate.full_name = displayName
          if (!existingProfile?.avatar_url) profileUpdate.avatar_url = avatarUrl

          if (Object.keys(profileUpdate).length > 0 || !existingProfile) {
            await prisma.profile.upsert({
              where: { user_id: user.id },
              update: profileUpdate,
              create: {
                user_id: user.id,
                full_name: displayName,
                avatar_url: avatarUrl,
              },
            })
          }
        }

        return done(null, user)
      } catch (err) {
        return done(err)
      }
    }
    )
  )
}

module.exports = passport
