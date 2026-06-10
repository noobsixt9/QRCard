const { z } = require('zod')

const designConfigSchema = z.object({
  template: z.string().min(1),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  show_avatar: z.boolean().optional().default(true),
  font: z.string().optional().default('inter'),
})

const createOrderSchema = z.object({
  design_config: designConfigSchema,
  qr_type: z.enum(['ONLINE', 'OFFLINE']),
  quantity: z.number().int().min(10).max(500),
  notes: z.string().max(500).optional(),
})

const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
})

module.exports = { createOrderSchema, orderQuerySchema }
