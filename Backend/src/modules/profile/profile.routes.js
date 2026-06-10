const express = require('express')
const auth = require('../../middleware/auth')
const requireRole = require('../../middleware/requireRole')
const validate = require('../../middleware/validate')
const upload = require('../../middleware/upload')
const { updateProfileSchema } = require('./profile.schema')
const profileController = require('./profile.controller')

const router = express.Router()

router.get('/public/:username', profileController.getPublicProfile)

router.get('/', auth, requireRole('USER', 'ADMIN'), profileController.getProfile)
router.put('/', auth, requireRole('USER', 'ADMIN'), validate(updateProfileSchema), profileController.updateProfile)
router.post('/avatar', auth, requireRole('USER', 'ADMIN'), upload.single('avatar'), profileController.uploadAvatar)
router.delete('/avatar', auth, requireRole('USER', 'ADMIN'), profileController.removeAvatar)

module.exports = router
