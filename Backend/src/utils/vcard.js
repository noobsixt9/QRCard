function escapeVCard(value) {
  if (!value) return ''
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function parseName(fullName) {
  if (!fullName) return { family: '', given: '' }
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { family: parts[0], given: '' }
  const family = parts.pop()
  const given = parts.join(' ')
  return { family, given }
}

function buildVCard(profile, username) {
  const { family, given } = parseName(profile.full_name)
  const profileUrl = `${process.env.CLIENT_BASE_URL}/u/${username}`

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(profile.full_name || username)}`,
    `N:${escapeVCard(family)};${escapeVCard(given)};;;`,
  ]

  if (profile.company) lines.push(`ORG:${escapeVCard(profile.company)}`)
  if (profile.job_title) lines.push(`TITLE:${escapeVCard(profile.job_title)}`)
  if (profile.phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(profile.phone)}`)

  const email = profile.public_email || profile.email
  if (email) lines.push(`EMAIL:${escapeVCard(email)}`)
  if (profile.website) lines.push(`URL:${escapeVCard(profile.website)}`)
  if (profileUrl) lines.push(`URL:${escapeVCard(profileUrl)}`)

  if (profile.bio) {
    const note = profile.bio.slice(0, 500)
    lines.push(`NOTE:${escapeVCard(note)}`)
  }

  lines.push('END:VCARD')
  return lines.join('\n')
}

module.exports = { buildVCard, escapeVCard }
