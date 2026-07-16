import { describe, expect, it } from 'vitest'
import { configFormSchema, isRaceCountUnusuallyHigh, resolveBoatLabels } from './configSchema'

function issuesFor(path: string, result: ReturnType<typeof configFormSchema.safeParse>): string[] {
  if (result.success) return []
  return result.error.issues.filter((issue) => issue.path.join('.') === path).map((issue) => issue.message)
}

describe('configFormSchema: team count mode', () => {
  it.each([1, 31])('rejects team count %i (out of range)', (teamCount) => {
    const result = configFormSchema.safeParse({ mode: 'count', teamCount, raceCount: 4 })
    expect(result.success).toBe(false)
    expect(issuesFor('teamCount', result)).toHaveLength(1)
  })

  it.each([2, 30])('accepts boundary team count %i', (teamCount) => {
    const result = configFormSchema.safeParse({ mode: 'count', teamCount, raceCount: 4 })
    expect(result.success).toBe(true)
  })

  it('rejects a missing team count', () => {
    const result = configFormSchema.safeParse({ mode: 'count', raceCount: 4 })
    expect(result.success).toBe(false)
    expect(issuesFor('teamCount', result)).toHaveLength(1)
  })

  it('resolves sequential labels 1..n', () => {
    const parsed = configFormSchema.parse({ mode: 'count', teamCount: 5, raceCount: 3 })
    expect(resolveBoatLabels(parsed)).toEqual(['1', '2', '3', '4', '5'])
  })
})

describe('configFormSchema: boat list mode', () => {
  it('accepts a valid unique list', () => {
    const result = configFormSchema.safeParse({ mode: 'list', boatListRaw: '3,7,12,15', raceCount: 3 })
    expect(result.success).toBe(true)
  })

  it('rejects duplicate boat labels and names them', () => {
    const result = configFormSchema.safeParse({ mode: 'list', boatListRaw: '3,7,3', raceCount: 3 })
    expect(result.success).toBe(false)
    const [message] = issuesFor('boatListRaw', result)
    expect(message).toContain('3')
  })

  it('rejects fewer than 2 unique boats', () => {
    const result = configFormSchema.safeParse({ mode: 'list', boatListRaw: '3', raceCount: 3 })
    expect(result.success).toBe(false)
    expect(issuesFor('boatListRaw', result)).toHaveLength(1)
  })

  it('rejects more than 30 unique boats', () => {
    const many = Array.from({ length: 31 }, (_, i) => i + 1).join(',')
    const result = configFormSchema.safeParse({ mode: 'list', boatListRaw: many, raceCount: 3 })
    expect(result.success).toBe(false)
    expect(issuesFor('boatListRaw', result)).toHaveLength(1)
  })

  it('resolves the parsed label list in order', () => {
    const parsed = configFormSchema.parse({ mode: 'list', boatListRaw: '21, 3, 15', raceCount: 3 })
    expect(resolveBoatLabels(parsed)).toEqual(['21', '3', '15'])
  })
})

describe('configFormSchema: race count', () => {
  it.each([0, -1])('rejects race count %i', (raceCount) => {
    const result = configFormSchema.safeParse({ mode: 'count', teamCount: 8, raceCount })
    expect(result.success).toBe(false)
    expect(issuesFor('raceCount', result)).toHaveLength(1)
  })

  it('rejects an absurdly high race count', () => {
    const result = configFormSchema.safeParse({ mode: 'count', teamCount: 8, raceCount: 51 })
    expect(result.success).toBe(false)
    expect(issuesFor('raceCount', result)).toHaveLength(1)
  })

  it('accepts race count 1', () => {
    const result = configFormSchema.safeParse({ mode: 'count', teamCount: 8, raceCount: 1 })
    expect(result.success).toBe(true)
  })
})

describe('isRaceCountUnusuallyHigh', () => {
  it('is false at and below 6, true above', () => {
    expect(isRaceCountUnusuallyHigh(6)).toBe(false)
    expect(isRaceCountUnusuallyHigh(7)).toBe(true)
  })
})
