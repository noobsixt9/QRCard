const { z } = require('zod')

// Accepts a full URL, partial URL (no scheme), or empty string
const optionalUrl = z
  .string()
  .max(500)
  .refine(
    (v) => {
      if (!v || v === '') return true
      try {
        new URL(v.startsWith('http://') || v.startsWith('https://') ? v : `https://${v}`)
        return true
      } catch { return false }
    },
    { message: 'Invalid URL' }
  )
  .optional()
  .nullable()

// Accepts a valid email or empty string
const optionalEmail = z
  .string()
  .refine((v) => !v || v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: 'Invalid email address',
  })
  .optional()
  .nullable()

const socialLinksSchema = z
  .object({
    linkedin:  optionalUrl,
    github:    optionalUrl,
    twitter:   optionalUrl,
    instagram: optionalUrl,
    facebook:  optionalUrl,
  })
  .optional()

const updateProfileSchema = z.object({
  full_name:    z.string().min(1).max(100).optional(),
  job_title:    z.string().max(100).optional(),
  company:      z.string().max(100).optional(),
  bio:          z.string().max(1000).optional(),
  phone:        z.string().max(30).optional(),
  public_email: optionalEmail,
  website:      optionalUrl,
  address:      z.string().max(255).optional(),
  avatar_url:   z.string().optional().nullable(),
  social_links: socialLinksSchema,
  is_public:    z.boolean().optional(),
})

module.exports = { updateProfileSchema }
