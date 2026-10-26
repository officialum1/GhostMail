// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

export type ExtractedOtpResult = {
  found: boolean
  otp: string | null
  verificationLink: string | null
}

/**
 * Common regex patterns to detect verification/OTP codes in subject and body.
 */
const OTP_CONTEXT_PATTERNS = [
  /(?:verification\s*code|security\s*code|login\s*code|confirmation\s*code|passcode|one-time\s*password|otp|pin)\s*(?:is|:|-)?\s*([0-9]{4,8})\b/i,
  /(?:\bcode|\botp|\bpin)\s+(?:is|:|-)\s*([0-9]{4,8})\b/i,
  /(?:code|otp|pin)\s*[:#]\s*([0-9]{4,8})\b/i,
  /\b([0-9]{4,8})\s*(?:is\s+your\s+(?:verification|confirmation|login|security|otp)\s+code)/i,
  /(?:use\s+(?:code\s+)?)([0-9]{4,8})\s+(?:to\s+(?:verify|log\s*in|sign\s*in|confirm))/i,
  /\benter\s+([0-9]{4,8})\b/i,
]

/**
 * Common regex pattern to find verification and activation URLs.
 */
const VERIFICATION_URL_PATTERN =
  /https?:\/\/[^\s<>"{}|\\^`[\]]+(?:verify|verification|confirm|confirmation|activate|activation|auth)[^\s<>"{}|\\^`[\]]*/i

export function extractOtpAndLinks(subject: string = '', bodyText: string = '', bodyHtml: string = ''): ExtractedOtpResult {
  const combinedText = `${subject}\n${bodyText}`

  // 1. Check contextual patterns first (highest accuracy)
  for (const pattern of OTP_CONTEXT_PATTERNS) {
    const match = combinedText.match(pattern)
    if (match && match[1]) {
      const code = match[1].trim()
      // Filter out obvious false positives like years (1990-2035) if exactly 4 digits and context is weak
      return {
        found: true,
        otp: code,
        verificationLink: extractVerificationLink(combinedText, bodyHtml),
      }
    }
  }

  // 2. Check standalone highlighted numbers (e.g. 6-digit codes standing alone on a line)
  const standaloneMatch = combinedText.match(/(?:^|\n|\r)\s*([0-9]{5,8})\s*(?:$|\n|\r)/)
  if (standaloneMatch && standaloneMatch[1]) {
    return {
      found: true,
      otp: standaloneMatch[1].trim(),
      verificationLink: extractVerificationLink(combinedText, bodyHtml),
    }
  }

  // 3. Check for any 6-digit number if word "code" or "verify" appears anywhere in subject or body
  if (/code|verify|otp|login|confirm/i.test(combinedText)) {
    const looseMatch = combinedText.match(/\b([0-9]{6})\b/)
    if (looseMatch && looseMatch[1]) {
      return {
        found: true,
        otp: looseMatch[1].trim(),
        verificationLink: extractVerificationLink(combinedText, bodyHtml),
      }
    }
  }

  const link = extractVerificationLink(combinedText, bodyHtml)
  return {
    found: Boolean(link),
    otp: null,
    verificationLink: link,
  }
}

function extractVerificationLink(text: string, html: string): string | null {
  // First look in HTML href attributes for clean URLs
  const hrefMatch = html.match(/href=["'](https?:\/\/[^"']*(?:verify|confirm|activate|token)[^"']*)["']/i)
  if (hrefMatch && hrefMatch[1]) {
    return hrefMatch[1].trim()
  }

  // Next look in plain text
  const match = text.match(VERIFICATION_URL_PATTERN)
  if (match && match[0]) {
    return match[0].trim()
  }

  return null
}
