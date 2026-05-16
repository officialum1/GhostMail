import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const adminCount = await db.admin.count();

    if (adminCount > 0) {
      return NextResponse.json({ error: 'Already configured' }, { status: 403 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await db.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true, email: admin.email });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
