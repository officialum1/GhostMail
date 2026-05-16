import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';
  const password = process.env.ADMIN_PASSWORD || 'password123';

  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    console.log(`Admin user created with email: ${email}`);
  } else {
    console.log(`Admin user with email ${email} already exists`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
