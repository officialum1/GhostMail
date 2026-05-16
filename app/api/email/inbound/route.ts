import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseRawEmail } from '@/lib/parseEmail';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedSecret = `Bearer ${process.env.WEBHOOK_SECRET}`;

    if (!authHeader || authHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    let rawEmailData = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const emailField = formData.get('email');
      if (typeof emailField === 'string') {
        rawEmailData = emailField;
      } else if (emailField instanceof File) {
        rawEmailData = await emailField.text();
      }
    } else if (contentType.includes('application/json')) {
      const json = await req.json();
      rawEmailData = json.raw || json.email;
    }

    if (!rawEmailData) {
      // Return 200 so Cloudflare doesn't retry
      return NextResponse.json({ success: true, message: 'No email data found' });
    }

    const parsedEmail = await parseRawEmail(rawEmailData);

    if (!parsedEmail.to) {
      return NextResponse.json({ success: true, message: 'No recipient found' });
    }

    const user = await db.user.findUnique({
      where: { email: parsedEmail.to.toLowerCase() }
    });

    if (user) {
      await db.email.create({
        data: {
          toAddress: parsedEmail.to.toLowerCase(),
          fromAddress: parsedEmail.from || 'unknown',
          subject: parsedEmail.subject || '(No Subject)',
          bodyText: parsedEmail.text,
          bodyHtml: parsedEmail.html,
          rawHeaders: parsedEmail.headers,
          userId: user.id
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 so Cloudflare doesn't retry
    return NextResponse.json({ success: true, error: 'Internal error processed' });
  }
}
