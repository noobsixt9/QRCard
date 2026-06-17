require('dotenv').config()

const app = require('./src/app')

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`QRCard API running on http://localhost:${PORT}`)
  console.log(`OpenAPI JSON: http://localhost:${PORT}/openapi.json`)
})
