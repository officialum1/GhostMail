import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

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
    }

    return NextResponse.json({ success: true, banned: !user.isBanned })
  } catch (error) {
    console.error('Failed to toggle user ban:', error)
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
  }
}
