const prisma = require('../../config/db')
const { getGeminiModel } = require('../../config/gemini')
const { calculateCompleteness, getCompletenessLevel } = require('../../utils/completeness')

async function generateBio(userId) {
  const profile = await prisma.profile.findUnique({ where: { user_id: userId } })

  if (!profile?.full_name || !profile?.job_title) {
    const err = new Error('Profile incomplete: full_name and job_title are required')
    err.status = 400
    throw err
  }

  const model = getGeminiModel()
  if (!model) {
    const err = new Error('Gemini API is not configured')
    err.status = 502
    throw err
  }

  const prompt = `Generate a concise, professional bio in 2-3 sentences for the following person.
Write in third person. Do not include any extra commentary or formatting.

Name: ${profile.full_name}
Job Title: ${profile.job_title}
Company: ${profile.company || 'N/A'}
Website: ${profile.website || 'N/A'}

Bio:`

  try {
    const result = await model.generateContent(prompt)
    const bio = result.response.text().trim()
    return { bio }
  } catch (err) {
    const error = new Error('Gemini API unavailable')
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

  const model = getGeminiModel()
  if (!model) {
    return {
      score,
      level,
      missing_fields: missing,
      suggestions: missing.map(
        (field) => `Complete your ${field.replace(/_/g, ' ')} to improve your profile.`
      ),
    }
  }

  const prompt = `A user's digital profile is ${score}% complete.
Missing or incomplete fields: ${missing.join(', ')}.

Give exactly 3 short, actionable suggestions (as a numbered list) to improve their profile.
Each suggestion should be one sentence only. No extra commentary.`

  try {
    const result = await model.generateContent(prompt)
    const suggestions = parseSuggestions(result.response.text())

    return {
      score,
      level,
      missing_fields: missing,
      suggestions: suggestions.length ? suggestions : missing.map(
        (field) => `Add your ${field.replace(/_/g, ' ')}.`
      ),
    }
  } catch {
    return {
      score,
      level,
      missing_fields: missing,
      suggestions: missing.map(
        (field) => `Complete your ${field.replace(/_/g, ' ')} to improve your profile.`
      ),
    }
  }
}

module.exports = { generateBio, getCompletenessSuggestions }
