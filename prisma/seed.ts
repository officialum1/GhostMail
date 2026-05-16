import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ghostmail.store'
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123'

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL or ADMIN_PASSWORD not set in environment')
    return
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
    },
  })

  console.log(`Admin created/updated: ${admin.email}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
