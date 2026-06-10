const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@qrcard.com' },
    update: {},
    create: {
      email: 'admin@qrcard.com',
      username: 'admin',
      password_hash: passwordHash,
      role: 'ADMIN',
      profile: {
        create: {
          full_name: 'QRCard Admin',
          job_title: 'Administrator',
          company: 'QRCard Nepal',
        },
      },
    },
    include: { profile: true },
  })

  console.log('Seeded admin user:', admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
