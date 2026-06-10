const { ZodError } = require('zod')

function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
    })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
    })
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token has expired' })
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File exceeds 2MB limit',
    })
  }

  if (err.message?.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }

  console.error(err)

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  })
}

module.exports = errorHandler
