import { NextResponse } from 'next/server'
import { logActivity } from '@/lib/activity'
import { logAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/admin-auth'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { db } from '@/lib/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const id = Number.parseInt(params.id, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
    }

    const { reason } = await req.json()
    const user = await db.user.findUnique({
      where: { id },
      include: { bannedUser: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.isBanned) {
      await db.$transaction([
        db.user.update({
          where: { id },
          data: { isBanned: false },
        }),
        db.bannedUser.deleteMany({
          where: { userId: id },
        }),
      ])
    } else {
      await db.$transaction([
        db.user.update({
          where: { id },
          data: { isBanned: true },
        }),
        db.bannedUser.upsert({
          where: { userId: id },
          create: { userId: id, reason: reason || null },
          update: { reason: reason || null },
        }),
      ])

      await logActivity({
        type: 'user_banned',
        message: `User banned: ${user.username}`,
        userId: user.id,
        metadata: JSON.stringify({ reason }),
      })
    }

    const admin = await getAdminFromToken()
    if (admin) {
      await logAudit(
        admin.adminId,
        user.isBanned ? 'user_unban' : 'user_ban',
        user.username,
        reason,
        getClientIp(req)
      )
    }

    return NextResponse.json({ success: true, banned: !user.isBanned })
  } catch (error) {
    console.error('Failed to toggle user ban:', error)
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
  }
}
