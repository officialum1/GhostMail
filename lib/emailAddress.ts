export function normalizeEmailAddress(value: string | null | undefined) {
  if (!value) return ''

  const trimmed = value.trim()
  const match = trimmed.match(/<([^>]+)>/)
  const candidate = (match?.[1] ?? trimmed).trim()

  return candidate.toLowerCase()
}
