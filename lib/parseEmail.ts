import PostalMime from 'postal-mime'
import { extractEmailAddresses, normalizeEmailAddress } from '@/lib/emailAddress'

function addressFromField(field: unknown): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  if (Array.isArray(field)) {
    for (const item of field) {
      const addr = addressFromField(item)
      if (addr) return addr
    }
    return ''
  }
  if (typeof field === 'object' && field !== null && 'address' in field) {
    return String((field as { address?: string }).address || '')
  }
  return ''
}

export async function parseRawEmail(raw: string | ArrayBuffer | Uint8Array) {
  const parser = new PostalMime()
  const email = await parser.parse(raw)

  const toCandidates = [
    ...extractEmailAddresses(addressFromField(email.to)),
    ...extractEmailAddresses(addressFromField(email.cc)),
    ...extractEmailAddresses(addressFromField(email.bcc)),
  ]

  const deliveredTo = email.headers?.find(
    (h) => h.key?.toLowerCase() === 'delivered-to'
  )
  if (deliveredTo?.value) {
    toCandidates.push(...extractEmailAddresses(String(deliveredTo.value)))
  }

  const to =
    toCandidates[0] ||
    normalizeEmailAddress(addressFromField(email.to)) ||
    ''

  return {
    from: normalizeEmailAddress(addressFromField(email.from)) || 'unknown',
    to,
    toAll: [...new Set(toCandidates.filter(Boolean))],
    subject: email.subject || '',
    text: email.text || '',
    html: email.html || '',
    headers: email.headers ? JSON.stringify(email.headers) : '',
  }
}
