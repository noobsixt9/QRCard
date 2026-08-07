const prisma = require('../../config/db')
const { calculateCompleteness } = require('../../utils/completeness')
const { uploadAvatar, deleteAvatar } = require('../../utils/storageService')

async function getOwnProfile(userId) {
  const profile = await prisma.profile.findUnique({ where: { user_id: userId } })
  if (!profile) {
    const err = new Error('Profile not found')
    err.status = 404
    throw err
  }
  return profile
}

function normalizeUrl(v) {
  if (!v || v.trim() === '') return null
  const t = v.trim()
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  return `https://${t}`
}

async function updateProfile(userId, data) {
  const payload = { ...data }

  // Normalize URL fields — empty string → null, partial URL → https://
  if ('website' in payload) payload.website = normalizeUrl(payload.website)
  if ('public_email' in payload && payload.public_email === '') payload.public_email = null
  if ('phone'   in payload && payload.phone   === '') payload.phone   = null
  if ('address' in payload && payload.address === '') payload.address = null
  if ('bio'     in payload && payload.bio     === '') payload.bio     = null

  if (payload.social_links && typeof payload.social_links === 'object') {
    payload.social_links = Object.fromEntries(
      Object.entries(payload.social_links).map(([k, v]) => [k, normalizeUrl(v)])
    )
  }

  const existing = await prisma.profile.findUnique({ where: { user_id: userId } })
  const merged = { ...existing, ...payload }
  const { score } = calculateCompleteness(merged)

  const profile = await prisma.profile.upsert({
    where: { user_id: userId },
    update: { ...payload, completeness_score: score },
    create: { user_id: userId, ...payload, completeness_score: score },
  })

  return profile
}

async function uploadUserAvatar(userId, file) {
  const profile = await prisma.profile.findUnique({ where: { user_id: userId } })
  const oldUrl = profile?.avatar_url

  const { url } = await uploadAvatar(userId, file)

  if (oldUrl) {
    await deleteAvatar(oldUrl)
  }

  const merged = { ...profile, avatar_url: url }
  const { score } = calculateCompleteness(merged)

  return prisma.profile.upsert({
    where: { user_id: userId },
    update: { avatar_url: url, completeness_score: score },
    create: { user_id: userId, avatar_url: url, completeness_score: score },
  })
}

async function deleteUserAvatar(userId) {
  const profile = await prisma.profile.findUnique({ where: { user_id: userId } })

  if (profile?.avatar_url) {
    await deleteAvatar(profile.avatar_url)
  }

  const merged = { ...profile, avatar_url: null }
  const { score } = calculateCompleteness(merged)

  return prisma.profile.upsert({
    where: { user_id: userId },
    update: { avatar_url: null, completeness_score: score },
    create: { user_id: userId, avatar_url: null, completeness_score: score },
  })
}

async function getPublicProfile(username) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { profile: true },
  })

  if (!user || !user.is_active || !user.profile || user.profile.is_public === false) {
    const err = new Error('Profile not found')
    err.status = 404
    throw err
  }

  prisma.qRCode
    .updateMany({
      where: { user_id: user.id, type: 'ONLINE' },
      data: { scan_count: { increment: 1 } },
    })
    .catch(() => {})

  const { profile } = user

  return {
    username: user.username,
    full_name: profile.full_name,
    job_title: profile.job_title,
    company: profile.company,
    bio: profile.bio,
    phone: profile.phone,
    public_email: profile.public_email,
    website: profile.website,
    avatar_url: profile.avatar_url,
    social_links: profile.social_links,
  }
}

module.exports = {
  getOwnProfile,
  updateProfile,
  uploadUserAvatar,
  deleteUserAvatar,
  getPublicProfile,
}
