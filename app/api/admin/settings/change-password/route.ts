import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { logAudit } from '@/lib/audit'
import { db } from '@/lib/db'

const MIN_PASSWORD_LENGTH = 10
const MAX_PASSWORD_LENGTH = 200

export async function POST(req: Request) {
  try {
    // Resolve the *calling* admin. The previous `findFirst({orderBy: createdAt})`
    // changed the oldest admin's password regardless of who was signed in.
    const session = await getAdminFromToken()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()
    const currentPassword = typeof payload?.currentPassword === 'string' ? payload.currentPassword : ''
    const newPassword = typeof payload?.newPassword === 'string' ? payload.newPassword : ''

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing password fields' }, { status: 400 })
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword.length > MAX_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (newPassword === currentPassword) {
      return NextResponse.json({ error: 'New password must be different' }, { status: 400 })
    }

    const admin = await db.admin.findUnique({
      where: { id: session.adminId },
      select: { id: true, email: true, password: true },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, admin.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    await db.admin.update({
      where: { id: admin.id },
      data: { password: await bcrypt.hash(newPassword, 12) },
    })

    await logAudit(
      admin.id,
      'admin_password_change',
      admin.email,
      'Admin changed their own password',
      getClientIp(req)
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to change admin password:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
