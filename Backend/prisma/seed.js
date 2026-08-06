const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const firebaseUid = process.env.ADMIN_FIREBASE_UID

  if (!firebaseUid) {
    console.log(
      'Skipping admin seed: set ADMIN_FIREBASE_UID in .env to the Firebase UID of your admin user.'
    )
    return
  }

  const admin = await prisma.user.upsert({
    where: { email: 'admin@qrcard.com' },
    update: { firebase_uid: firebaseUid, role: 'ADMIN' },
    create: {
      firebase_uid: firebaseUid,
      email: 'admin@qrcard.com',
      username: 'admin',
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
