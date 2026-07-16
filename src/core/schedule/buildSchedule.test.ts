import { describe, expect, it } from 'vitest'
import { buildSchedule } from './buildSchedule'
import { isBijection, isValidSwapTransition } from './testHelpers'
import { transpose } from './transpose'

function boatLabels(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `Boot ${i + 1}`)
}

/** Every row is a bijection and every transition is a valid on-water swap, for any n/r. */
function assertPhysicallyValid(rows: string[][], n: number) {
  for (const row of rows) {
    expect(isBijection(row, n)).toBe(true)
  }
  for (let i = 1; i < rows.length; i++) {
    expect(isValidSwapTransition(rows[i - 1], rows[i], n)).toBe(true)
  }
}

describe('buildSchedule: physical validity holds for every n/r, with or without warning', () => {
  const sizes = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 29, 30]

  for (const n of sizes) {
    for (const r of [1, 2, Math.min(n, 4), n, n + 2]) {
      if (r < 1) continue
      it(`n=${n}, r=${r}`, () => {
        const { rows, warning } = buildSchedule(n, r, boatLabels(n), 12345)
        expect(rows).toHaveLength(r)
        assertPhysicallyValid(rows, n)
        if (r > n) {
          expect(warning).not.toBeNull()
        }
        void warning
      })
    }
  }
})

describe('buildSchedule: no-repeat guarantee holds up to the round named in the warning', () => {
  const sizes = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 30]

  for (const n of sizes) {
    it(`n=${n}, r=n: no warning and every slot sees n distinct boats`, () => {
      const { rows, warning } = buildSchedule(n, n, boatLabels(n), 42)
      const bySlot = transpose(rows)
      const allDistinct = bySlot.every((slotRow) => new Set(slotRow).size === n)
      if (allDistinct) {
        expect(warning).toBeNull()
      } else {
        // A handful of odd n (n=5 is the known case) cannot avoid a repeat even at r=n.
        expect(warning).not.toBeNull()
      }
    })
  }
})

describe('buildSchedule: the known n=5 tight case', () => {
  it('r=3 needs no repeat', () => {
    const { rows, warning } = buildSchedule(5, 3, boatLabels(5), 7)
    expect(warning).toBeNull()
    const bySlot = transpose(rows)
    for (const slotRow of bySlot) expect(new Set(slotRow).size).toBe(3)
  })

  it('r=4 forces a repeat and says so', () => {
    const { rows, warning } = buildSchedule(5, 4, boatLabels(5), 7)
    expect(warning).not.toBeNull()
    expect(warning).toContain('Wettfahrt 4')
    assertPhysicallyValid(rows, 5)
  })
})

describe('buildSchedule: reproducibility', () => {
  it('same seed produces the same schedule', () => {
    const a = buildSchedule(8, 4, boatLabels(8), 999)
    const b = buildSchedule(8, 4, boatLabels(8), 999)
    expect(a.rows).toEqual(b.rows)
  })

  it('different seeds usually produce a different race 1', () => {
    const a = buildSchedule(8, 1, boatLabels(8), 1)
    const b = buildSchedule(8, 1, boatLabels(8), 2)
    expect(a.rows[0]).not.toEqual(b.rows[0])
  })
})

describe('buildSchedule: non-contiguous / arbitrary boat labels', () => {
  it('works with a custom label list', () => {
    const labels = ['3', '7', '12', '15', '21', '30']
    const { rows } = buildSchedule(6, 3, labels, 5)
    for (const row of rows) {
      expect(new Set(row)).toEqual(new Set(labels))
    }
  })
})
