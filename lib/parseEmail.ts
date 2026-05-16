import PostalMime from 'postal-mime';

export async function parseRawEmail(raw: string) {
  const parser = new PostalMime();
  const email = await parser.parse(raw);
  
  return {
    from: email.from?.address || 'unknown',
    to: (email.to && email.to.length > 0) ? email.to[0].address : '',
    subject: email.subject,
    text: email.text,
    html: email.html,
    headers: JSON.stringify(email.headers)
  };
}
