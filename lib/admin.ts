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
  const stringValue = String(value ?? '')
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export function generateRandomPassword(length = 12) {
  return crypto
    .randomBytes(length * 2)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, length)
}
