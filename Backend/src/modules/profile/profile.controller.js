const profileService = require('./profile.service')

async function getProfile(req, res, next) {
  try {
    const profile = await profileService.getOwnProfile(req.user.id)
    res.status(200).json({ success: true, data: profile })
  } catch (err) {
    next(err)
  }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await profileService.updateProfile(req.user.id, req.body)
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    })
  } catch (err) {
    next(err)
  }
}

async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    const profile = await profileService.uploadUserAvatar(req.user.id, req.file)
    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: profile,
    })
  } catch (err) {
    next(err)
  }
}

async function removeAvatar(req, res, next) {
  try {
    const profile = await profileService.deleteUserAvatar(req.user.id)
    res.status(200).json({
      success: true,
      message: 'Avatar removed successfully',
      data: profile,
    })
  } catch (err) {
    next(err)
  }
}

async function getPublicProfile(req, res, next) {
  try {
    const profile = await profileService.getPublicProfile(req.params.username)
    res.status(200).json({ success: true, data: profile })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  getPublicProfile,
}
