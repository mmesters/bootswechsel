import type { IndexRow } from './types'

/**
 * Continues a schedule past the point where no-repeat can no longer be
 * guaranteed. Still produces exactly one valid physical transition per round
 * (disjoint pairs, plus one triangle for odd n) — it just no longer avoids a
 * slot receiving a boat it has already had. Uses a fixed, non-searched
 * pattern (a rotating triangle on slots 0..2 for odd n, plus a fixed pair
 * swap on the rest) since correctness no longer depends on history, only on
 * "every transition is fixed-point-free and swap-realizable".
 */
export function continueRelaxed(lastRow: IndexRow, n: number, additionalRounds: number): IndexRow[] {
  const rows: IndexRow[] = []
  let cur = lastRow.slice()
  const isOdd = n % 2 !== 0

  for (let i = 0; i < additionalRounds; i++) {
    const next = cur.slice()

    if (isOdd) {
      next[0] = cur[2]
      next[1] = cur[0]
      next[2] = cur[1]
    }

    const pairStart = isOdd ? 3 : 0
    for (let j = pairStart; j + 1 < n; j += 2) {
      next[j] = cur[j + 1]
      next[j + 1] = cur[j]
    }

    cur = next
    rows.push(cur.slice())
  }

  return rows
}
