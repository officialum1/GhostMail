export function normalizeEmailAddress(value: string | null | undefined) {
  if (!value) return ''

  const trimmed = value.trim()
  const match = trimmed.match(/<([^>]+)>/)
  const candidate = (match?.[1] ?? trimmed).trim()

  return candidate.toLowerCase()
}

export function extractEmailAddresses(value: string | null | undefined) {
  if (!value) return []

  return value
    .split(/[,\n;]/)
    .map((part) => normalizeEmailAddress(part))
    .filter((part, index, all) => Boolean(part) && all.indexOf(part) === index)
}
