import type { BoatId, BuildScheduleResult, IndexRow } from './types'
import { buildEvenSchedule } from './evenConstruction'
import { searchOddSchedule } from './oddSearch'
import { continueRelaxed } from './relaxedFallback'
import { createRng } from './rng'

function warningText(fromRound: number, n: number, r: number): string {
  return `Ab Wettfahrt ${fromRound} kann eine Wiederholung nicht mehr vermieden werden (bei ${n} Booten und ${r} Wettfahrten reicht die Anzahl unterschiedlicher Boote nicht mehr aus, um jedem Team ein noch nicht gefahrenes Boot zu geben).`
}

/**
 * Builds a fair boat-rotation schedule: for each of the `r` races, which
 * boat each of the `n` slots (teams) gets, such that every transition
 * between races is realizable on the water as disjoint pairwise swaps (plus
 * exactly one three-way rotation when n is odd), and no slot repeats a boat
 * for as long as that's mathematically possible. `boatLabels` must have
 * exactly `n` distinct entries; `rngSeed` makes race 1's draw reproducible.
 */
export function buildSchedule(n: number, r: number, boatLabels: BoatId[], rngSeed: number): BuildScheduleResult {
  if (boatLabels.length !== n) {
    throw new Error(`boatLabels must contain exactly n=${n} entries, got ${boatLabels.length}`)
  }
  if (n < 2) throw new Error('n must be at least 2')
  if (r < 1) throw new Error('r must be at least 1')

  const rng = createRng(rngSeed)

  let indexRows: IndexRow[]
  let warning: string | null

  if (n % 2 === 0) {
    indexRows = buildEvenSchedule(n, r, rng)
    warning = r > n ? warningText(n + 1, n, r) : null
  } else {
    const { rows: strictRows, reachedFull } = searchOddSchedule(n, r, rng)
    if (reachedFull) {
      indexRows = strictRows
      warning = null
    } else {
      const remaining = r - strictRows.length
      const relaxedRows = continueRelaxed(strictRows[strictRows.length - 1], n, remaining)
      indexRows = [...strictRows, ...relaxedRows]
      warning = warningText(strictRows.length + 1, n, r)
    }
  }

  const rows = indexRows.map((row) => row.map((boatIndex) => boatLabels[boatIndex]))
  return { rows, warning }
}
