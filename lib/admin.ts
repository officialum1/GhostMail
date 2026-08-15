import crypto from 'node:crypto'
import { db } from '@/lib/db'

export const DEFAULT_BLACKLISTED_USERNAMES = [
  'admin',
  'root',
  'support',
  'help',
  'info',
  'mail',
  'email',
  'contact',
  'noreply',
  'no-reply',
  'system',
  'ghost',
  'ghostmail',
]

export const DEFAULT_BLACKLISTED_DOMAINS = [
  'tempmail.com',
  'guerrillamail.com',
  'throwaway.email',
]

export const DEFAULT_ADMIN_SETTINGS = {
  siteName: 'GhostMail',
  maxEmailsPerUser: '1000',
  emailRetentionDays: '30',
  registration_enabled: 'true',
  maintenance_mode: 'false',
  maintenance_message: "We're performing scheduled maintenance. We'll be back shortly.",
  min_username_length: '3',
} as const

export type AdminSettingsMap = Record<string, string>

export async function getAdminSettingsMap() {
  const settings = await db.adminSetting.findMany()
  const map: AdminSettingsMap = { ...DEFAULT_ADMIN_SETTINGS }

  for (const setting of settings) {
    map[setting.key] = setting.value
  }

  return map
}

export async function getAdminSetting(key: keyof typeof DEFAULT_ADMIN_SETTINGS) {
  const settings = await getAdminSettingsMap()
  return settings[key]
}

export function parseSettingNumber(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function csvEscape(value: string | number | null | undefined) {
  let stringValue = String(value ?? '')

  // Neutralise spreadsheet formula injection. Usernames and email addresses are
  // user-controlled, so a cell like `=HYPERLINK(...)` would execute when an
  // admin opens the export in Excel/Sheets. Prefixing with a tab keeps the text
  // readable while forcing the cell to be parsed as a string.
  if (/^[=+\-@\t\r]/.test(stringValue)) {
    stringValue = `\t${stringValue}`
  }

  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export function generateRandomPassword(length = 16) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const bytes = crypto.randomBytes(length * 2)
  let out = ''

  // Rejection sampling keeps every character equally likely; `% alphabet.length`
  // would bias toward the start of the alphabet.
  for (let i = 0; i < bytes.length && out.length < length; i += 1) {
    const byte = bytes[i]
    if (byte < 256 - (256 % alphabet.length)) {
      out += alphabet[byte % alphabet.length]
    }
  }

  // Astronomically unlikely, but never return a short password.
  while (out.length < length) {
    out += alphabet[crypto.randomInt(alphabet.length)]
  }

  return out
}
