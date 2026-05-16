import { generateSecret, generateURI, verify } from 'otplib'

export function createTotpSecret() {
  return generateSecret()
}

export function createTotpUri(email: string, secret: string) {
  return generateURI({
    issuer: 'GhostMail',
    label: email,
    secret,
  })
}

export async function verifyTotpToken(token: string, secret: string) {
  const result = await verify({ token, secret })
  return result.valid
}
