const Groq = require('groq-sdk')

let client = null

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) return null
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return client
}

const GROQ_MODEL = 'llama-3.3-70b-versatile'

module.exports = { getGroqClient, GROQ_MODEL }
