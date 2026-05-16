import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/admin-auth'
import { generateRandomPassword } from '@/lib/admin'
import { db } from '@/lib/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const id = Number.parseInt(params.id, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
    }

    const password = generateRandomPassword(12)
    const hashedPassword = await bcrypt.hash(password, 12)

    await db.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true, password })
  } catch (error) {
    console.error('Failed to reset password:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
