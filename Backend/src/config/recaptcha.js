function isRecaptchaConfigured() {
  return Boolean(process.env.RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY)
}

async function verifyRecaptchaToken(token) {
  if (!isRecaptchaConfigured()) {
    return { skipped: true }
  }

  const params = new URLSearchParams({
    secret: process.env.RECAPTCHA_SECRET_KEY,
    response: token,
  })

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    throw new Error(`reCAPTCHA verify failed with status ${response.status}`)
  }

  const data = await response.json()

  return {
    valid: Boolean(data.success),
    hostname: data.hostname || null,
    challenge_ts: data.challenge_ts || null,
    reason: data['error-codes']?.join(', ') || null,
  }
}

module.exports = {
  isRecaptchaConfigured,
  verifyRecaptchaToken,
}
