const prisma = require('../../config/db')
const { getGroqClient, GROQ_MODEL } = require('../../config/groq')
const { calculateCompleteness, getCompletenessLevel } = require('../../utils/completeness')

async function generateBio(userId) {
  const profile = await prisma.profile.findUnique({ where: { user_id: userId } })

  if (!profile?.full_name || !profile?.job_title) {
    const err = new Error('Profile incomplete: full_name and job_title are required')
    err.status = 400
    throw err
  }

  const groq = getGroqClient()
  if (!groq) {
    const err = new Error('AI service is not configured')
    err.status = 502
    throw err
  }

  const details = [
    `Name: ${profile.full_name}`,
    `Job Title: ${profile.job_title}`,
    profile.company      ? `Company: ${profile.company}`   : null,
    profile.website      ? `Website: ${profile.website}`   : null,
    profile.address      ? `Location: ${profile.address}`  : null,
    profile.bio          ? `Current bio hint: ${profile.bio}` : null,
  ].filter(Boolean).join('\n')

  const messages = [
    {
      role: 'system',
      content: `You are a professional bio writer for digital business cards.
Write concise, engaging, third-person professional bios.
Rules:
- 2-3 sentences maximum
- Third person (use the person's name)
- Warm, confident, and specific — not generic
- Mention their role and company naturally
- End with what makes them valuable or their passion
- Under 400 characters total
- Output ONLY the bio text — no quotes, no labels, no extra text`,
    },
    {
      role: 'user',
      content: `Write a professional bio for:\n${details}`,
    },
  ]

  try {
    const completion = await groq.chat.completions.create({
      model:       GROQ_MODEL,
      messages,
      max_tokens:  150,
      temperature: 0.7,
    })
    const bio = completion.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || ''
    return { bio }
  } catch (err) {
    console.error('Groq AI error:', err.message)
    const error = new Error('AI service unavailable')
    error.status = 502
    throw error
  }
}

function parseSuggestions(text) {
  return text
    .split('\n')
    .map((line) => line.replace(/^\d+[\).\s]+/, '').trim())
    .filter((line) => line.length > 0)
    .slice(0, 3)
}

async function getCompletenessSuggestions(userId) {
  const profile = await prisma.profile.findUnique({ where: { user_id: userId } })

  if (!profile) {
    const err = new Error('Profile not found')
    err.status = 404
    throw err
  }

  const { score, missing } = calculateCompleteness(profile)
  const level = getCompletenessLevel(score)

  if (score === 100) {
    return {
      score,
      level,
      missing_fields: [],
      suggestions: ['Your profile is complete! Great job.'],
    }
  }

  const groq = getGroqClient()
  if (!groq) {
    return {
      score,
      level,
      missing_fields: missing,
      suggestions: missing.map((f) => `Complete your ${f.replace(/_/g, ' ')} to improve your profile.`),
    }
  }

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You give short, actionable profile improvement tips. Output exactly 3 numbered suggestions, one sentence each, no extra text.',
        },
        {
          role: 'user',
          content: `A user's digital visiting card profile is ${score}% complete. Missing fields: ${missing.join(', ')}. Give 3 specific tips to improve it.`,
        },
      ],
      max_tokens: 120,
      temperature: 0.5,
    })
    const suggestions = parseSuggestions(completion.choices[0]?.message?.content || '')
    return {
      score,
      level,
      missing_fields: missing,
      suggestions: suggestions.length ? suggestions : missing.map((f) => `Add your ${f.replace(/_/g, ' ')}.`),
    }
  } catch {
    return {
      score,
      level,
      missing_fields: missing,
      suggestions: missing.map((f) => `Complete your ${f.replace(/_/g, ' ')} to improve your profile.`),
    }
  }
}

module.exports = { generateBio, getCompletenessSuggestions }
