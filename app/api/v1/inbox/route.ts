// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextResponse } from 'next/server'
import { verifyDeveloperApiKey, paymentRequiredResponse } from '@/lib/apiAuth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const auth = await verifyDeveloperApiKey(req)
    if (!auth.isAuthorized) {
      return paymentRequiredResponse(auth.error)
    }

    const { searchParams } = new URL(req.url)
    const targetEmail = searchParams.get('email')?.toLowerCase().trim()
    const targetUsername = searchParams.get('username')?.toLowerCase().trim()

    if (!targetEmail && !targetUsername) {
      return NextResponse.json(
        { error: 'Query parameter "email" or "username" is required (e.g. ?email=user@ghostmail.store)' },
        { status: 400 }
      )
    }

    const user = await db.user.findFirst({
      where: {
        OR: [
          ...(targetEmail ? [{ email: targetEmail }] : []),
          ...(targetUsername ? [{ username: targetUsername }] : []),
        ],
      },
      select: { id: true, email: true, username: true, isBanned: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Mailbox not found' }, { status: 404 })
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'Mailbox is suspended' }, { status: 403 })
    }

    const rawLimit = Number.parseInt(searchParams.get('limit') || '20', 10)
    const limit = Number.isFinite(rawLimit) ? Math.min(50, Math.max(1, rawLimit)) : 20

    const rawPage = Number.parseInt(searchParams.get('page') || '1', 10)
    const page = Number.isFinite(rawPage) ? Math.max(1, rawPage) : 1
    const skip = (page - 1) * limit

    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const whereClause = {
      userId: user.id,
      deletedAt: null,
      ...(unreadOnly ? { isRead: false } : {}),
    }

    const [emails, total] = await Promise.all([
      db.email.findMany({
        where: whereClause,
        orderBy: { receivedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          fromAddress: true,
          toAddress: true,
          subject: true,
          bodyText: true,
          receivedAt: true,
          isRead: true,
        },
      }),
      db.email.count({ where: whereClause }),
    ])

    const formatted = emails.map((e) => ({
      id: e.id,
      from: e.fromAddress,
      to: e.toAddress,
      subject: e.subject,
      preview: e.bodyText.slice(0, 150),
      receivedAt: e.receivedAt.toISOString(),
      isRead: e.isRead,
    }))

    return NextResponse.json({
      success: true,
      mailbox: user.email,
      total,
      page,
      limit,
      messages: formatted,
    })
  } catch (error) {
    console.error('API inbox error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
