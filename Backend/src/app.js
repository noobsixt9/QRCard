require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
const openApiSpec = require('../openapi.json')
const { generalLimiter } = require('./middleware/rateLimiter')
const notFound = require('./middleware/notFound')
const errorHandler = require('./middleware/errorHandler')

const authRoutes = require('./modules/auth/auth.routes')
const profileRoutes = require('./modules/profile/profile.routes')
const qrRoutes = require('./modules/qrcode/qr.routes')
const aiRoutes = require('./modules/ai/ai.routes')
const orderRoutes = require('./modules/orders/order.routes')
const adminRoutes = require('./modules/admin/admin.routes')

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_BASE_URL || 'http://localhost:3000',
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use(generalLimiter)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'QRCard API is running' })
})

app.get('/api-docs.json', (_req, res) => {
  res.json(openApiSpec)
})
app.get('/openapi.json', (_req, res) => {
  res.json(openApiSpec)
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/qr', qrRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
