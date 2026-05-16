import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeEmailAddress } from '@/lib/emailAddress';
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

    const normalizedTo = normalizeEmailAddress(finalTo);
    const normalizedFrom = normalizeEmailAddress(finalFrom) || 'unknown';

    if (!normalizedTo) {
      return NextResponse.json({ error: 'No recipient' }, { status: 400 });
    }

    console.log(`Email received for: ${normalizedTo}`);

    const user = await db.user.findUnique({
      where: { email: normalizedTo }
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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to prevent Cloudflare retries
    return NextResponse.json({ success: true, processed: false });
  }
}
