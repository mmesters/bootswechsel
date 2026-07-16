import type { IndexRow } from './types'
import { type Rng, shuffle } from './rng'

/**
 * Builds an r x n schedule (boat indices) for an EVEN slot count n.
 *
 * Race 1 is a random shuffle of boat indices onto slot positions. Every later
 * race alternates between two fixed perfect matchings on those positions:
 *   A = {(0,1), (2,3), ...}
 *   B = {(1,2), (3,4), ..., (n-1,0)}
 * A ∪ B is exactly the edge set of the Hamiltonian cycle 0-1-2-...-(n-1)-0, so
 * alternating A/B is an odd-even-transposition rotation of tokens around that
 * ring: every slot visits every boat exactly once over n rounds (a full Latin
 * square), and every single transition is realizable as disjoint on-water
 * pairwise swaps. No search is needed and this never fails for any r.
 */
export function buildEvenSchedule(n: number, r: number, rng: Rng): IndexRow[] {
  if (n % 2 !== 0) throw new Error('buildEvenSchedule requires an even n')

  const matchingA: Array<[number, number]> = []
  for (let i = 0; i + 1 < n; i += 2) matchingA.push([i, i + 1])

  const matchingB: Array<[number, number]> = []
  for (let i = 1; i + 1 < n; i += 2) matchingB.push([i, i + 1])
  if (n >= 2) matchingB.push([n - 1, 0])

  let cur = shuffle(
    Array.from({ length: n }, (_, i) => i),
    rng,
  )
  const rows: IndexRow[] = [cur.slice()]

  for (let round = 1; round < r; round++) {
    const matching = round % 2 === 1 ? matchingA : matchingB
    const next = cur.slice()
    for (const [a, b] of matching) {
      next[a] = cur[b]
      next[b] = cur[a]
    }
    cur = next
    rows.push(cur.slice())
  }

  return rows
}
