import { NextResponse } from 'next/server'
import { DEFAULT_BLACKLISTED_USERNAMES } from '@/lib/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const items = await db.blacklistedUsername.findMany({
      orderBy: { username: 'asc' },
    })

    const defaults = DEFAULT_BLACKLISTED_USERNAMES.map((username) => ({
      id: `default:${username}`,
      username,
      createdAt: null,
      isDefault: true,
    }))

    const custom = items.map((item) => ({
      ...item,
      id: String(item.id),
      isDefault: false,
    }))

    return NextResponse.json([...defaults, ...custom])
  } catch (error) {
    console.error('Failed to fetch username blacklist:', error)
    return NextResponse.json({ error: 'Failed to fetch blacklist' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const { username } = await req.json()
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const created = await db.blacklistedUsername.create({
      data: { username: String(username).toLowerCase() },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Failed to add blacklisted username:', error)
    return NextResponse.json({ error: 'Failed to add username' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const { id } = await req.json()
    await db.blacklistedUsername.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete blacklisted username:', error)
    return NextResponse.json({ error: 'Failed to delete username' }, { status: 500 })
  }
}
