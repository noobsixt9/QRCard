const { z } = require('zod')

const createVendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(30).optional(),
  address: z.string().max(255).optional(),
  notes: z.string().max(500).optional(),
})

const updateVendorSchema = createVendorSchema.partial()

const assignVendorSchema = z.object({
  vendor_id: z.string().uuid('Invalid vendor_id'),
})

module.exports = { createVendorSchema, updateVendorSchema, assignVendorSchema }
