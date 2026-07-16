import type { IndexRow } from './types'
import { type Rng, shuffle } from './rng'

/**
 * Search-node budget across the whole schedule build. n,r <= 30 keeps this
 * comfortably fast in practice; the cap exists purely so a pathological
 * configuration degrades to the relaxed fallback instead of hanging the UI.
 */
export const ODD_SEARCH_NODE_BUDGET = 200_000

export interface OddSearchResult {
  /** The longest strict (no-repeat) prefix of rows that could be constructed. */
  rows: IndexRow[]
  /** True if `rows.length === r`, i.e. no repeat was necessary at all. */
  reachedFull: boolean
}

/**
 * Builds as many rows as possible of an r x n schedule for an ODD slot count
 * n, where every transition is exactly one 3-cycle plus disjoint 2-cycles,
 * and no slot repeats a boat while still possible.
 *
 * No closed-form construction exists for the general odd case (unlike the
 * even case), so this backtracks: at each round it searches for a valid
 * matching+triangle via MRV-ordered search, and recursing into the next
 * round is part of the SAME backtracking tree — if every choice at round
 * i+1 dead-ends, the search resumes trying alternative matchings at round i
 * rather than giving up. This is what correctly finds the true achievable
 * length (e.g. n=5 tops out at 3 strict rounds, not 5) instead of getting
 * stuck on a locally-valid-but-globally-wrong greedy choice.
 *
 * The longest valid prefix found is tracked continuously, so even when the
 * full r rounds aren't achievable (or the node budget runs out first), the
 * function still returns the best strict schedule found so far.
 */
export function searchOddSchedule(n: number, r: number, rng: Rng): OddSearchResult {
  if (n % 2 === 0) throw new Error('searchOddSchedule requires an odd n')

  const initial = shuffle(
    Array.from({ length: n }, (_, i) => i),
    rng,
  )
  const initialHistory: Array<Set<number>> = initial.map((boat) => new Set([boat]))

  const rows: IndexRow[] = [initial.slice()]
  let best: IndexRow[] = [initial.slice()]
  let nodes = 0

  const isCompatiblePair = (cur: IndexRow, history: Array<Set<number>>, a: number, b: number): boolean =>
    !history[a].has(cur[b]) && !history[b].has(cur[a])

  /** The two fixed-point-free rotations of a 3-cycle {a,b,c}, filtered to history-valid ones. */
  const triangleOptions = (
    cur: IndexRow,
    history: Array<Set<number>>,
    a: number,
    b: number,
    c: number,
  ): Array<[number, number, number]> => {
    const candidates: Array<[number, number, number]> = [
      [cur[c], cur[a], cur[b]],
      [cur[b], cur[c], cur[a]],
    ]
    return candidates.filter(
      ([na, nb, nc]) => !history[a].has(na) && !history[b].has(nb) && !history[c].has(nc),
    )
  }

  function extend(level: number, cur: IndexRow, history: Array<Set<number>>): boolean {
    if (level === r) return true
    return buildMatching(
      level,
      cur,
      history,
      Array.from({ length: n }, (_, i) => i),
      [],
      false,
    )
  }

  function buildMatching(
    level: number,
    cur: IndexRow,
    history: Array<Set<number>>,
    remaining: number[],
    assignment: Array<{ slot: number; boat: number }>,
    usedTriangle: boolean,
  ): boolean {
    nodes++
    if (nodes > ODD_SEARCH_NODE_BUDGET) return false

    if (remaining.length === 0) {
      const next = cur.slice()
      for (const { slot, boat } of assignment) next[slot] = boat
      const nextHistory = history.map((seen, slot) => {
        const copy = new Set(seen)
        copy.add(next[slot])
        return copy
      })
      rows.push(next)
      if (rows.length > best.length) best = rows.slice()
      if (extend(level + 1, next, nextHistory)) return true
      rows.pop()
      return false
    }

    // MRV heuristic: branch on the slot with the fewest compatible partners first.
    let pivot = remaining[0]
    let pivotPartners: number[] = []
    let fewest = Infinity
    for (const s of remaining) {
      const partners = remaining.filter((t) => t !== s && isCompatiblePair(cur, history, s, t))
      if (partners.length < fewest) {
        fewest = partners.length
        pivot = s
        pivotPartners = partners
      }
    }

    for (const partner of shuffle(pivotPartners, rng)) {
      const nextRemaining = remaining.filter((s) => s !== pivot && s !== partner)
      const nextAssignment = [
        ...assignment,
        { slot: pivot, boat: cur[partner] },
        { slot: partner, boat: cur[pivot] },
      ]
      if (buildMatching(level, cur, history, nextRemaining, nextAssignment, usedTriangle)) return true
    }

    if (!usedTriangle && remaining.length >= 3) {
      const others = remaining.filter((s) => s !== pivot)
      const otherPairs = shuffle(
        others.flatMap((b, i) => others.slice(i + 1).map((c): [number, number] => [b, c])),
        rng,
      )
      for (const [b, c] of otherPairs) {
        for (const option of shuffle(triangleOptions(cur, history, pivot, b, c), rng)) {
          const nextRemaining = remaining.filter((s) => s !== pivot && s !== b && s !== c)
          const nextAssignment = [
            ...assignment,
            { slot: pivot, boat: option[0] },
            { slot: b, boat: option[1] },
            { slot: c, boat: option[2] },
          ]
          if (buildMatching(level, cur, history, nextRemaining, nextAssignment, true)) return true
        }
      }
    }

    return false
  }

  const reachedFull = extend(1, initial, initialHistory)
  return { rows: reachedFull ? rows : best, reachedFull }
}
