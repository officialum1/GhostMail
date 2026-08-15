import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';
import { getClientIp } from '@/lib/clientIp';
import { normalizeEmailAddress } from '@/lib/emailAddress';
import { checkRateLimit } from '@/lib/rateLimit';
import nodemailer from 'nodemailer';

const MAX_SUBJECT = 200
const MAX_BODY = 100 * 1024

/** Basic address shape check — also rejects the CR/LF used for header injection. */
const EMAIL_RE = /^[^\s@<>",;:]+@[a-z0-9.-]+\.[a-z]{2,}$/i

/** Escapes text before it is placed into the HTML alternative part. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP is not configured; refusing to send.')
      return NextResponse.json({ error: 'Sending is not available' }, { status: 503 });
    }

    // Outbound mail from a free disposable-address service is a spam magnet.
    // Throttle per account and per IP.
    const ip = getClientIp(req)
    const userLimit = checkRateLimit(`send:user:${userId}`, 20, 60 * 60 * 1000)
    const ipLimit = checkRateLimit(`send:ip:${ip}`, 40, 60 * 60 * 1000)
    if (!userLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Sending limit reached. Please try again later.' },
        { status: 429 }
      );
    }

    // Re-read the account: a session JWT outlives a ban.
    const sender = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true, isBanned: true },
    })
    if (!sender || sender.isBanned) {
      return NextResponse.json({ error: 'Account is not allowed to send mail' }, { status: 403 });
    }

    const payload = await req.json();
    const normalizedTo = normalizeEmailAddress(payload?.to);
    const subject = typeof payload?.subject === 'string' ? payload.subject : '';
    const body = typeof payload?.body === 'string' ? payload.body : '';

    if (!normalizedTo || !subject.trim() || !body.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!EMAIL_RE.test(normalizedTo)) {
      return NextResponse.json({ error: 'Invalid recipient address' }, { status: 400 });
    }

    if (subject.length > MAX_SUBJECT) {
      return NextResponse.json({ error: 'Subject is too long' }, { status: 400 });
    }

    if (body.length > MAX_BODY) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 });
    }

    // Strip CR/LF so a crafted subject can't inject extra SMTP headers
    // (Bcc, Content-Type, ...) into the outgoing message.
    const safeSubject = subject.replace(/[\r\n]+/g, ' ').trim();
    const displayName = sender.username.replace(/[\r\n"<>]/g, '');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: true, // Use SSL/TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${displayName}" <${sender.email}>`,
      to: normalizedTo,
      replyTo: sender.email,
      subject: safeSubject,
      text: body,
      html: escapeHtml(body).replace(/\n/g, '<br>'),
    });

    await db.email.create({
      data: {
        toAddress: normalizedTo,
        fromAddress: sender.email,
        subject: safeSubject,
        bodyText: body,
        sent: true,
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
