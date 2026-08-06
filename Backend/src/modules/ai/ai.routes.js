const express = require('express')
const auth = require('../../middleware/auth')
const requireRole = require('../../middleware/requireRole')
const { aiLimiter } = require('../../middleware/rateLimiter')
const aiController = require('./ai.controller')

const router = express.Router()

router.use(auth, requireRole('USER', 'ADMIN'), aiLimiter)

router.post('/bio', aiController.generateBio)
router.get('/completeness', aiController.completeness)

module.exports = router
