import { NextResponse } from 'next/server'
import { DEFAULT_BLACKLISTED_DOMAINS } from '@/lib/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const items = await db.blacklistedDomain.findMany({
      orderBy: { domain: 'asc' },
    })

    const defaults = DEFAULT_BLACKLISTED_DOMAINS.map((domain) => ({
      id: `default:${domain}`,
      domain,
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
    console.error('Failed to fetch domain blacklist:', error)
    return NextResponse.json({ error: 'Failed to fetch blacklist' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const { domain } = await req.json()
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    const created = await db.blacklistedDomain.create({
      data: { domain: String(domain).toLowerCase() },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Failed to add blacklisted domain:', error)
    return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const authError = await requireAdmin()
    if (authError) return authError
    const { id } = await req.json()
    await db.blacklistedDomain.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete blacklisted domain:', error)
    return NextResponse.json({ error: 'Failed to delete domain' }, { status: 500 })
  }
}
