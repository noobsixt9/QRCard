/**
 * Creates (or resets) the admin account with email/password login.
 * Usage: node prisma/create-admin.js
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from .env, or falls back to defaults.
 */

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  const email    = process.env.ADMIN_EMAIL    || 'admin@qrcard.com'
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456'
  const username = process.env.ADMIN_USERNAME || 'admin'

  const password_hash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where: { username },
    update: {
      email,
      password_hash,
      role:        'ADMIN',
      is_active:   true,
      is_verified: true,
    },
    create: {
      email,
      username,
      password_hash,
      role:        'ADMIN',
      is_active:   true,
      is_verified: true,
    },
  })

  console.log('✅ Admin account ready')
  console.log(`   Email   : ${admin.email}`)
  console.log(`   Username: ${admin.username}`)
  console.log(`   Role    : ${admin.role}`)
  console.log(`   Active  : ${admin.is_active}`)
  console.log('')
  console.log('Login at: http://localhost:5173/admin')
}

main()
  .catch((err) => {
    console.error('❌ Failed: ', err.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
