import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';
import { normalizeEmailAddress } from '@/lib/emailAddress';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, body } = await req.json();
    const normalizedTo = normalizeEmailAddress(to);

    if (!normalizedTo || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // Use SSL/TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"${session.user.name}" <${session.user.email}>`,
      to: normalizedTo,
      replyTo: session.user.email,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
    });

    const userId = Number(session.user.id);
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    // Save to DB
    await db.email.create({
        data: {
        toAddress: normalizedTo,
        fromAddress: session.user.email,
        subject: subject,
        bodyText: body,
        sent: true,
        userId: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
