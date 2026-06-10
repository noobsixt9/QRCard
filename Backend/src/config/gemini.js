const { GoogleGenerativeAI } = require('@google/generative-ai')

let model = null

function getGeminiModel() {
  if (!process.env.GEMINI_API_KEY) {
    return null
  }
  if (!model) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }
  return model
}

module.exports = { getGeminiModel }
