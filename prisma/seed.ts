import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/** Must match the cost factor used by the application when hashing. */
const BCRYPT_ROUNDS = 12
const MIN_PASSWORD_LENGTH = 10

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  // No default credentials: a seeded `password123` admin is a full compromise
  // of every account if the seed is ever run against a deployed database.
  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must both be set to seed the admin account.')
  }

  if (adminPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`)
  }

  const existing = await prisma.admin.findUnique({
    where: { email: adminEmail },
    select: { id: true },
  })

  // Re-running the seed must not silently reset a rotated admin password.
  if (existing) {
    if (process.env.ADMIN_PASSWORD_RESET !== 'true') {
      console.log(
        `Admin ${adminEmail} already exists; leaving the password unchanged. ` +
          'Set ADMIN_PASSWORD_RESET=true to overwrite it.'
      )
      return
    }

    await prisma.admin.update({
      where: { email: adminEmail },
      data: { password: await bcrypt.hash(adminPassword, BCRYPT_ROUNDS) },
    })
    console.log(`Admin password reset: ${adminEmail}`)
    return
  }

  await prisma.admin.create({
    data: {
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, BCRYPT_ROUNDS),
    },
  })

  console.log(`Admin created: ${adminEmail}`)
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
