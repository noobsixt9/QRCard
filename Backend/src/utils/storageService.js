const fs = require('fs')
const path = require('path')
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const { s3, BUCKET, PUBLIC_URL } = require('../config/storage')

const LOCAL_UPLOAD_DIR = path.join(__dirname, '../../uploads/avatars')

function getExtension(mimetype) {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  return map[mimetype] || 'jpg'
}

function extractKeyFromUrl(url) {
  if (!url) return null
  const marker = '/avatars/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return `avatars/${url.slice(idx + marker.length)}`
}

async function uploadToS3(key, buffer, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )
  return `${PUBLIC_URL}/${key}`
}

async function uploadToLocal(key, buffer) {
  const filename = key.replace('avatars/', '')
  const filePath = path.join(LOCAL_UPLOAD_DIR, filename)
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true })
  fs.writeFileSync(filePath, buffer)
  return `${process.env.APP_BASE_URL}/uploads/avatars/${filename}`
}

async function deleteFromS3(key) {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
  } catch (err) {
    console.warn('S3 delete failed, falling back to local:', err.message)
  }
}

async function deleteFromLocal(key) {
  const filename = key.replace('avatars/', '')
  const filePath = path.join(LOCAL_UPLOAD_DIR, filename)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

async function uploadAvatar(userId, file) {
  const ext = getExtension(file.mimetype)
  const key = `avatars/${userId}-${Date.now()}.${ext}`

  try {
    const url = await uploadToS3(key, file.buffer, file.mimetype)
    return { url, key }
  } catch (err) {
    console.warn('S3 upload failed, using local storage:', err.message)
    const url = await uploadToLocal(key, file.buffer)
    return { url, key }
  }
}

async function deleteAvatar(url) {
  const key = extractKeyFromUrl(url)
  if (!key) return

  await deleteFromS3(key)
  await deleteFromLocal(key)
}

module.exports = {
  uploadAvatar,
  deleteAvatar,
  extractKeyFromUrl,
}
