export interface ParseBoatLabelsResult {
  /** Unique labels, trimmed, in first-occurrence order. */
  labels: string[]
  /** Distinct labels that appeared more than once, in order of first duplicate occurrence. */
  duplicates: string[]
}

/** Splits user input on commas, semicolons, and newlines, trims, and reports duplicates by name. */
export function parseBoatLabels(raw: string): ParseBoatLabelsResult {
  const tokens = raw
    .split(/[,;\n]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)

  const seen = new Set<string>()
  const duplicates: string[] = []
  const labels: string[] = []

  for (const token of tokens) {
    if (seen.has(token)) {
      if (!duplicates.includes(token)) duplicates.push(token)
    } else {
      seen.add(token)
      labels.push(token)
    }
  }

  return { labels, duplicates }
}
