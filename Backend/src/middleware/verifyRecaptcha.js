const { isRecaptchaConfigured, verifyRecaptchaToken } = require('../config/recaptcha')

function verifyRecaptcha(expectedAction) {
  return async (req, res, next) => {
    if (!isRecaptchaConfigured()) {
      console.warn(`reCAPTCHA not configured — skipping verification for ${expectedAction}`)
      delete req.body.recaptchaToken
      return next()
    }

    const token = req.body.recaptchaToken
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification is required',
      })
    }

    try {
      const result = await verifyRecaptchaToken(token, expectedAction)

      if (!result.valid) {
        return res.status(403).json({
          success: false,
          message: 'reCAPTCHA verification failed',
        })
      }

      delete req.body.recaptchaToken
      next()
    } catch (err) {
      console.error('reCAPTCHA verification error:', err.message)
      return res.status(502).json({
        success: false,
        message: 'reCAPTCHA verification unavailable',
      })
    }
  }
}

module.exports = verifyRecaptcha
