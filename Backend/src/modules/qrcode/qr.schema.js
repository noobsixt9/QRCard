const { z } = require('zod')

const qrTypeParamSchema = z.object({
  type: z.enum(['ONLINE', 'OFFLINE'], {
    errorMap: () => ({ message: 'Type must be ONLINE or OFFLINE' }),
  }),
})

module.exports = { qrTypeParamSchema }
