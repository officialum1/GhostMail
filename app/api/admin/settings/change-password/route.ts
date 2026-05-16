import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const { currentPassword, newPassword } = await req.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing password fields' }, { status: 400 })
    }

    const admin = await db.admin.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, admin.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await db.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to change admin password:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
