import { NextResponse } from 'next/server'
import { logActivity } from '@/lib/activity'
import { logAudit } from '@/lib/audit'
import { getAdminFromToken } from '@/lib/adminSession'
import { getClientIp } from '@/lib/clientIp'
import { db } from '@/lib/db'

const MAX_REASON_LENGTH = 500

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromToken()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = Number.parseInt(params.id, 10)
    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const reason =
      typeof body?.reason === 'string' && body.reason.trim()
        ? body.reason.trim().slice(0, MAX_REASON_LENGTH)
        : null

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, username: true, isBanned: true },
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
          create: { userId: id, reason },
          update: { reason },
        }),
      ])

      await logActivity({
        type: 'user_banned',
        message: `User banned: ${user.username}`,
        userId: user.id,
        metadata: JSON.stringify({ reason }),
      })
    }

    await logAudit(
      admin.adminId,
      user.isBanned ? 'user_unban' : 'user_ban',
      user.username,
      reason ?? undefined,
      getClientIp(req)
    )

    return NextResponse.json({ success: true, banned: !user.isBanned })
  } catch (error) {
    console.error('Failed to toggle user ban:', error)
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
  }
}
