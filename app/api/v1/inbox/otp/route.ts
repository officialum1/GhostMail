// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextResponse } from 'next/server'
import { verifyDeveloperApiKey, paymentRequiredResponse } from '@/lib/apiAuth'
import { extractOtpAndLinks } from '@/lib/otpExtractor'
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

    // Optional waitSeconds for long-polling (up to 20 seconds)
    const rawWait = Number.parseInt(searchParams.get('waitSeconds') || '0', 10)
    const waitSeconds = Number.isFinite(rawWait) ? Math.min(20, Math.max(0, rawWait)) : 0

    let latestEmail = await db.email.findFirst({
      where: { userId: user.id, deletedAt: null },
      orderBy: { receivedAt: 'desc' },
      select: {
        id: true,
        fromAddress: true,
        toAddress: true,
        subject: true,
        bodyText: true,
        bodyHtml: true,
        receivedAt: true,
      },
    })

    if (!latestEmail && waitSeconds > 0) {
      const startTime = Date.now()
      const maxWaitMs = waitSeconds * 1000

      while (Date.now() - startTime < maxWaitMs) {
        await new Promise((r) => setTimeout(r, 1500))
        latestEmail = await db.email.findFirst({
          where: { userId: user.id, deletedAt: null },
          orderBy: { receivedAt: 'desc' },
          select: {
            id: true,
            fromAddress: true,
            toAddress: true,
            subject: true,
            bodyText: true,
            bodyHtml: true,
            receivedAt: true,
          },
        })
        if (latestEmail) break
      }
    }

    if (!latestEmail) {
      return NextResponse.json({
        success: true,
        found: false,
        otp: null,
        verificationLink: null,
        message: 'No messages received yet in this mailbox',
      })
    }

    const extracted = extractOtpAndLinks(
      latestEmail.subject,
      latestEmail.bodyText,
      latestEmail.bodyHtml || ''
    )

    return NextResponse.json({
      success: true,
      found: extracted.found,
      otp: extracted.otp,
      verificationLink: extracted.verificationLink,
      messageDetails: {
        id: latestEmail.id,
        from: latestEmail.fromAddress,
        to: latestEmail.toAddress,
        subject: latestEmail.subject,
        receivedAt: latestEmail.receivedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('API OTP extraction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
