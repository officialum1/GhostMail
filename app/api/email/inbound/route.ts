import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { getAdminSettingsMap, parseSettingNumber } from '@/lib/admin'
import { logActivity } from '@/lib/activity'
import { db } from '@/lib/db'
import { notifyNewEmail } from '@/lib/emailEvents'
import { extractEmailAddresses, getEmailDomain, normalizeEmailAddress } from '@/lib/emailAddress'
import { parseRawEmail } from '@/lib/parseEmail'
import { sanitizeEmailHtml } from '@/lib/sanitizeHtml'

/** Length-safe, timing-safe bearer token comparison. */
function isAuthorized(authHeader: string | null) {
  const expected = process.env.WEBHOOK_SECRET

  // Fail closed: an unset secret previously made `Bearer undefined` a valid key.
  if (!expected || expected.length < 16) {
    console.error('WEBHOOK_SECRET is not configured; rejecting inbound mail.')
    return false
  }
  if (!authHeader) return false

  const provided = Buffer.from(authHeader)
  const want = Buffer.from(`Bearer ${expected}`)
  if (provided.length !== want.length) return false
  return crypto.timingSafeEqual(provided, want)
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req.headers.get('authorization'))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { raw, to, from } = body

    console.log('Inbound email - To:', to, 'From:', from)

    let subject = ''
    let bodyText = ''
    let bodyHtml = ''
    let rawHeaders = ''
    let toAddress = typeof to === 'string' ? to : ''
    let fromAddress = typeof from === 'string' ? from : ''
    let allRecipients: string[] = []

    if (raw) {
      try {
        const parsed = await parseRawEmail(raw)
        subject = parsed.subject
        bodyText = parsed.text
        bodyHtml = parsed.html
        fromAddress = parsed.from || fromAddress
        toAddress = parsed.to || toAddress
        allRecipients = parsed.toAll
        rawHeaders = parsed.headers
      } catch (parseError) {
        console.error('Email parse error:', parseError)
        subject = String(body.subject || 'No Subject')
        bodyText = String(body.text || body.body || '')
        bodyHtml = String(body.html || '')
      }
    } else {
      subject = String(body.subject || 'No Subject')
      bodyText = String(body.text || body.body || '')
      bodyHtml = String(body.html || '')
    }

    toAddress = normalizeEmailAddress(toAddress)
    fromAddress = normalizeEmailAddress(fromAddress) || 'unknown'

    const recipients = [
      ...new Set([
        ...allRecipients.map((addr) => normalizeEmailAddress(addr)).filter(Boolean),
        ...extractEmailAddresses(typeof to === 'string' ? to : ''),
        ...(toAddress ? [toAddress] : []),
      ]),
    ]

    // Cap stored sizes so a single message can't bloat the table or the inbox
    // response payload.
    subject = subject.slice(0, 500)
    bodyText = bodyText.slice(0, 256 * 1024)
    rawHeaders = rawHeaders.slice(0, 64 * 1024)
    const safeBodyHtml = sanitizeEmailHtml(bodyHtml)

    const settings = await getAdminSettingsMap()
    const maxEmails = parseSettingNumber(settings.maxEmailsPerUser, 1000)
    const senderDomain = getEmailDomain(fromAddress)

    if (senderDomain) {
      const blacklisted = await db.blacklistedDomain.findUnique({
        where: { domain: senderDomain },
      })
      if (blacklisted) {
        await db.webhookLog.create({
          data: {
            toAddress: recipients[0] || 'unknown',
            fromAddress,
            status: 'rejected_blacklisted_domain',
            error: senderDomain,
          },
        })
        return NextResponse.json({ success: true, message: 'Domain blacklisted' })
      }
    }

    let matchedUser: { id: number; isBanned: boolean } | null = null
    let matchedTo = ''

    // Only ever deliver to an address on our own domain. Without this, a
    // recipient header naming any user's address could be used to inject mail
    // into their inbox regardless of who the message was actually routed to.
    const ownDomain = (process.env.DOMAIN || '').toLowerCase()
    const deliverable = (recipients.length > 0 ? recipients : [toAddress].filter(Boolean)).filter(
      (recipient) => !ownDomain || getEmailDomain(recipient) === ownDomain
    )

    for (const recipient of deliverable) {
      const user = await db.user.findFirst({
        where: {
          email: {
            equals: recipient,
            mode: 'insensitive',
          },
        },
        select: { id: true, isBanned: true },
      })

      if (user) {
        matchedUser = user
        matchedTo = recipient
        break
      }
    }

    if (!matchedUser) {
      await db.webhookLog.create({
        data: {
          toAddress: recipients[0] || toAddress || 'unknown',
          fromAddress,
          status: 'no_matching_user',
        },
      })
      return NextResponse.json({ success: true, message: 'No user found' })
    }

    if (matchedUser.isBanned) {
      await db.webhookLog.create({
        data: {
          toAddress: matchedTo,
          fromAddress,
          status: 'rejected_banned_user',
        },
      })
      return NextResponse.json({ success: true, message: 'User banned' })
    }

    const emailCount = await db.email.count({
      where: { userId: matchedUser.id, deletedAt: null },
    })

    if (maxEmails > 0 && emailCount >= maxEmails) {
      await db.webhookLog.create({
        data: {
          toAddress: matchedTo,
          fromAddress,
          status: 'rejected_email_limit',
          error: `Limit ${maxEmails} reached`,
        },
      })
      return NextResponse.json({ success: true, message: 'Email limit exceeded' })
    }

    const savedEmail = await db.email.create({
      data: {
        toAddress: matchedTo,
        fromAddress,
        subject: subject || 'No Subject',
        bodyText: bodyText || '',
        bodyHtml: safeBodyHtml,
        rawHeaders: rawHeaders || null,
        userId: matchedUser.id,
        isRead: false,
      },
    })

    await db.user.update({
      where: { id: matchedUser.id },
      data: { lastActive: new Date() },
    })

    await db.webhookLog.create({
      data: {
        toAddress: matchedTo,
        fromAddress,
        status: 'success',
      },
    })

    notifyNewEmail(matchedUser.id)

    await logActivity({
      type: 'email_received',
      message: `Email received: ${subject || 'No Subject'} from ${fromAddress}`,
      userId: matchedUser.id,
      metadata: JSON.stringify({ from: fromAddress, subject: subject || 'No Subject' }),
    })

    const recentEmails = await db.email.count({
      where: {
        userId: matchedUser.id,
        receivedAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    })

    if (recentEmails > 50) {
      const userRecord = await db.user.findUnique({
        where: { id: matchedUser.id },
        select: { email: true },
      })
      await db.suspiciousActivity.create({
        data: {
          type: 'email_spike',
          description: `User ${userRecord?.email || matchedTo} received ${recentEmails} emails in 1 hour`,
          userId: matchedUser.id,
          severity: 'medium',
        },
      })
    }

    return NextResponse.json({ success: true, emailId: savedEmail.id })
  } catch (error) {
    console.error('Inbound email error:', error)

    try {
      await db.webhookLog.create({
        data: {
          toAddress: 'unknown',
          fromAddress: 'unknown',
          status: 'error',
          error: String(error).slice(0, 1000),
        },
      })
    } catch {}

    // 500 so Cloudflare's Email Worker logs the failure and the message isn't
    // silently dropped. Previously this returned 200 for genuine errors.
    return NextResponse.json({ success: false, error: 'Internal error logged' }, { status: 500 })
  }
}
