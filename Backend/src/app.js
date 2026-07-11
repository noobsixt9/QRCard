require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
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
const allowedOrigins = [
  process.env.CLIENT_BASE_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/qr', qrRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
