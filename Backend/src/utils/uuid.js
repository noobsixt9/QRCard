const { z } = require('zod')

const uuidSchema = z.string().uuid('Invalid UUID format')

function parseUuid(value, fieldName = 'id') {
  const result = uuidSchema.safeParse(value)
  if (!result.success) {
    const err = new Error(`Invalid ${fieldName}`)
    err.status = 400
    throw err
  }
  return result.data
}

module.exports = { parseUuid, uuidSchema }
