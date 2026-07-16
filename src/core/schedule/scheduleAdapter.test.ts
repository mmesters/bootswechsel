import { describe, expect, it } from 'vitest'
import { generateScheduleResult } from './scheduleAdapter'

describe('generateScheduleResult', () => {
  it('bySlot is the transpose of byRace', () => {
    const result = generateScheduleResult(['1', '2', '3', '4'], 3, 1)
    expect(result.byRace).toHaveLength(3)
    expect(result.bySlot).toHaveLength(4)
    for (let race = 0; race < 3; race++) {
      for (let slot = 0; slot < 4; slot++) {
        expect(result.bySlot[slot][race]).toBe(result.byRace[race][slot])
      }
    }
  })

  it('passes warning through unchanged (null when avoidable)', () => {
    const result = generateScheduleResult(['1', '2', '3', '4'], 4, 1)
    expect(result.warning).toBeNull()
  })

  it('passes warning through unchanged (set when unavoidable)', () => {
    const result = generateScheduleResult(['1', '2', '3', '4', '5'], 4, 1)
    expect(result.warning).not.toBeNull()
  })

  it('echoes back seed, boatLabels and raceCount, and stamps generatedAt', () => {
    const result = generateScheduleResult(['1', '2'], 2, 77)
    expect(result.seed).toBe(77)
    expect(result.boatLabels).toEqual(['1', '2'])
    expect(result.raceCount).toBe(2)
    expect(() => new Date(result.generatedAt).toISOString()).not.toThrow()
  })
})
