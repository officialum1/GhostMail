import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getAdminFromToken } from '@/lib/adminSession'
import { generateRandomPassword } from '@/lib/admin'
import { getClientIp } from '@/lib/clientIp'
import { logAudit } from '@/lib/audit'
import { db } from '@/lib/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromToken()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = Number.parseInt(params.id, 10)
    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
    }

    const password = generateRandomPassword(16)
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user
      .update({
        where: { id },
        data: { password: hashedPassword },
        select: { username: true, email: true },
      })
      .catch(() => null)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await logAudit(
      admin.adminId,
      'user_password_reset',
      user.username,
      `Reset password for ${user.email}`,
      getClientIp(req)
    )

    // The plaintext is returned once so the admin can hand it over; keep it out
    // of any shared or browser cache.
    return NextResponse.json(
      { success: true, password },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  } catch (error) {
    console.error('Failed to reset password:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
