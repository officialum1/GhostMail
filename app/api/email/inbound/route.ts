import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractEmailAddresses, normalizeEmailAddress } from '@/lib/emailAddress';
import { parseRawEmail } from '@/lib/parseEmail';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedSecret = `Bearer ${process.env.WEBHOOK_SECRET}`;

    if (!authHeader || authHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { raw, to, from, subject, text, html } = body;

    let finalTo = to;
    let finalFrom = from;
    let finalSubject = subject;
    let finalText = text;
    let finalHtml = html;
    let finalHeaders = '';

    if (raw) {
      const parsed = await parseRawEmail(raw);
      finalTo = parsed.to;
      finalFrom = parsed.from;
      finalSubject = parsed.subject;
      finalText = parsed.text;
      finalHtml = parsed.html;
      finalHeaders = parsed.headers;
    }

    const recipients = extractEmailAddresses(finalTo);
    const normalizedTo = recipients[0] || normalizeEmailAddress(finalTo);
    const normalizedFrom = normalizeEmailAddress(finalFrom) || 'unknown';

    if (!normalizedTo) {
      await db.webhookLog.create({
        data: {
          toAddress: '',
          fromAddress: normalizedFrom,
          status: 'rejected_no_recipient',
          error: 'No recipient found in inbound payload'
        }
      });

      return NextResponse.json({ error: 'No recipient' }, { status: 400 });
    }

    console.log(`Email received for: ${normalizedTo}`);

    const user = await db.user.findFirst({
      where: {
        email: {
          in: recipients.length > 0 ? recipients : [normalizedTo]
        }
      }
    });

    if (user) {
      await db.email.create({
        data: {
          toAddress: normalizedTo,
          fromAddress: normalizedFrom,
          subject: finalSubject || '(No Subject)',
          bodyText: finalText || '',
          bodyHtml: finalHtml,
          rawHeaders: finalHeaders,
          userId: user.id
        }
      });

      await db.webhookLog.create({
        data: {
          toAddress: normalizedTo,
          fromAddress: normalizedFrom,
          status: 'delivered'
        }
      });
    } else {
      await db.webhookLog.create({
        data: {
          toAddress: normalizedTo,
          fromAddress: normalizedFrom,
          status: 'no_matching_user',
          error: `Recipients checked: ${(recipients.length > 0 ? recipients : [normalizedTo]).join(', ')}`
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to prevent Cloudflare retries
    return NextResponse.json({ success: true, processed: false });
  }
}
