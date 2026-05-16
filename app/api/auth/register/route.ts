import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

const RESERVED_USERNAMES = [
  'admin',
  'root',
  'support',
  'help',
  'info',
  'mail',
  'email',
  'contact',
  'noreply',
  'no-reply',
  'system',
  'ghost',
  'ghostmail',
  'administrator',
  'mod',
  'moderator',
  'staff',
  'team',
  'official',
  'security',
  'abuse',
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const cleanUsername = String(username)
      .toLowerCase()
      .replace(/@.*/, '')
      .replace(/[^a-z0-9_-]/g, '')
      .trim()

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    if (cleanUsername.length > 20) {
      return NextResponse.json(
        { error: 'Username must be less than 20 characters' },
        { status: 400 }
      )
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (RESERVED_USERNAMES.includes(cleanUsername)) {
      return NextResponse.json(
        { error: 'This username is reserved. Please choose another.' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: cleanUsername },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken. Please choose another.' },
        { status: 400 }
      )
    }

    const domain = process.env.DOMAIN || 'ghostmail.store'
    const email = `${cleanUsername}@${domain}`

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Username already taken. Please choose another.' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email,
        password: hashedPassword,
      },
    })

    try {
      await prisma.activityLog.create({
        data: {
          type: 'user_registered',
          message: `New user registered: ${cleanUsername}`,
          userId: user.id,
          ip: req.headers.get('x-forwarded-for') || 'unknown',
        },
      })
    } catch (logError) {
      console.log('ActivityLog not available:', logError)
    }

    return NextResponse.json({
      success: true,
      email,
      message: `Account created! Your email is ${email}`,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
