import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const count = await db.admin.count()
    if (count > 0) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 403 })
    }

    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    
    if (!email || !password) {
      return NextResponse.json({ error: 'ADMIN_EMAIL or ADMIN_PASSWORD not configured' }, { status: 500 })
    }

    const hashed = await bcrypt.hash(password, 12)

    await db.admin.create({ data: { email, password: hashed } })

    return NextResponse.json({ success: true, email })
  } catch (error) {
    console.error('Setup failed:', error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
