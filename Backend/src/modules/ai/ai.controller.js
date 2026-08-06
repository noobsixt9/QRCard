const aiService = require('./ai.service')

async function generateBio(req, res, next) {
  try {
    const data = await aiService.generateBio(req.user.id)
    res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

async function completeness(req, res, next) {
  try {
    const data = await aiService.getCompletenessSuggestions(req.user.id)
    res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

module.exports = { generateBio, completeness }
