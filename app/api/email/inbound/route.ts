import { NextRequest, NextResponse } from 'next/server'
import { getAdminSettingsMap, parseSettingNumber } from '@/lib/admin'
import { logActivity } from '@/lib/activity'
import { db } from '@/lib/db'
import { notifyNewEmail } from '@/lib/emailEvents'
import { extractEmailAddresses, getEmailDomain, normalizeEmailAddress } from '@/lib/emailAddress'
import { parseRawEmail } from '@/lib/parseEmail'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const expectedSecret = process.env.WEBHOOK_SECRET

    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      console.log('Unauthorized webhook attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { raw, to, from } = body

    console.log('Inbound email - To:', to, 'From:', from)

    let subject = ''
    let bodyText = ''
    let bodyHtml = ''
    let rawHeaders = ''
    let toAddress = to || ''
    let fromAddress = from || ''
    let allRecipients: string[] = []

    if (raw) {
      try {
        const parsed = await parseRawEmail(raw)
        subject = parsed.subject
        bodyText = parsed.text
        bodyHtml = parsed.html
        fromAddress = parsed.from || from || ''
        toAddress = parsed.to || to || ''
        allRecipients = parsed.toAll
        rawHeaders = parsed.headers
      } catch (parseError) {
        console.error('Email parse error:', parseError)
        subject = body.subject || 'No Subject'
        bodyText = body.text || body.body || ''
        bodyHtml = body.html || ''
      }
    } else {
      subject = body.subject || 'No Subject'
      bodyText = body.text || body.body || ''
      bodyHtml = body.html || ''
    }

    toAddress = normalizeEmailAddress(toAddress)
    fromAddress = normalizeEmailAddress(fromAddress) || 'unknown'

    const recipients = [
      ...new Set([
        ...allRecipients.map((addr) => normalizeEmailAddress(addr)).filter(Boolean),
        ...extractEmailAddresses(to),
        ...(toAddress ? [toAddress] : []),
      ]),
    ]

    console.log('Parsed - To:', recipients.join(', '), 'From:', fromAddress, 'Subject:', subject)

    const settings = await getAdminSettingsMap()
    const maxEmails = parseSettingNumber(settings.maxEmailsPerUser, 1000)
    const senderDomain = getEmailDomain(fromAddress)

    if (senderDomain) {
      const blacklisted = await db.blacklistedDomain.findUnique({
        where: { domain: senderDomain },
      })
      if (blacklisted) {
        console.log('Blacklisted domain:', senderDomain)
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

    for (const recipient of recipients.length > 0 ? recipients : [toAddress].filter(Boolean)) {
      const user = await db.user.findFirst({
        where: {
          email: recipient,
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
      console.log('No user found for:', recipients.join(', ') || toAddress)
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
      console.log('User is banned:', matchedTo)
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
      console.log('User exceeded email limit:', matchedTo)
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
        bodyHtml: bodyHtml || null,
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

    console.log('Email saved successfully, id:', savedEmail.id)
    return NextResponse.json({ success: true, emailId: savedEmail.id })
  } catch (error) {
    console.error('Inbound email error:', error)

    try {
      await db.webhookLog.create({
        data: {
          toAddress: 'unknown',
          fromAddress: 'unknown',
          status: 'error',
          error: String(error),
        },
      })
    } catch {}

    return NextResponse.json({ success: true, error: 'Internal error logged' })
  }
}
