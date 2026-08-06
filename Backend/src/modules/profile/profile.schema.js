const { z } = require('zod')

const socialLinksSchema = z
  .object({
    linkedin: z.string().url().nullable().optional(),
    github: z.string().url().nullable().optional(),
    twitter: z.string().url().nullable().optional(),
    instagram: z.string().url().nullable().optional(),
    facebook: z.string().url().nullable().optional(),
  })
  .optional()

const updateProfileSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  job_title: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  phone: z.string().max(30).optional(),
  public_email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().max(255).optional(),
  social_links: socialLinksSchema,
})

module.exports = { updateProfileSchema }
