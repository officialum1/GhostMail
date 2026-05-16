import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (!/^[a-z0-9]+$/.test(username) || username.length < 3) {
      return NextResponse.json({ error: 'Username must be lowercase letters/numbers only, min 3 chars' }, { status: 400 });
    }

    const domain = process.env.DOMAIN || 'yourdomain.com';
    const email = `${username}@${domain}`;

    const existingUser = await db.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    return NextResponse.json({ success: true, email: user.email }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
