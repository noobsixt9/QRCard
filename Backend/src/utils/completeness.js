function calculateCompleteness(profile) {
  const missing = []
  let score = 0

  if (profile.full_name) score += 15
  else missing.push('full_name')

  if (profile.job_title) score += 10
  else missing.push('job_title')

  if (profile.company) score += 10
  else missing.push('company')

  if (profile.bio) score += 20
  else missing.push('bio')

  if (profile.phone) score += 10
  else missing.push('phone')

  if (profile.public_email) score += 10
  else missing.push('public_email')

  if (profile.avatar_url) score += 10
  else missing.push('avatar_url')

  if (profile.website) score += 5
  else missing.push('website')

  const socialLinks = profile.social_links || {}
  const hasSocial = Object.values(socialLinks).some((v) => v && String(v).trim())
  if (hasSocial) score += 10
  else missing.push('social_links')

  return { score, missing }
}

function getCompletenessLevel(score) {
  if (score <= 40) return 'Incomplete'
  if (score <= 70) return 'Moderate'
  if (score <= 90) return 'Good'
  return 'Complete'
}

module.exports = { calculateCompleteness, getCompletenessLevel }
