import { describe, expect, it } from 'vitest'
import { buildCommitteeOverviewRows } from './committeeOverviewXlsx'

const baseInput = {
  regattaName: '',
  raceLabels: ['WF 1', 'WF 2'],
  slotLabels: ['Los 1', 'Los 2'],
  bySlot: [
    ['1', '2'],
    ['2', '1'],
  ],
  warning: null,
  generatedAt: '2026-07-17T10:00:00.000Z',
  seed: 42,
}

describe('buildCommitteeOverviewRows', () => {
  it('omits the regatta name row when no name is given', () => {
    const rows = buildCommitteeOverviewRows(baseInput)
    expect(rows[0]).toEqual(['Bootswechsel – Übersicht für die Wettfahrtleitung'])
  })

  it('includes the trimmed regatta name as the first row when given', () => {
    const rows = buildCommitteeOverviewRows({ ...baseInput, regattaName: '  Vereinsregatta 2026  ' })
    expect(rows[0]).toEqual(['Vereinsregatta 2026'])
    expect(rows[1]).toEqual(['Bootswechsel – Übersicht für die Wettfahrtleitung'])
  })

  it('shows the positive confirmation text when there is no warning', () => {
    const rows = buildCommitteeOverviewRows(baseInput)
    expect(rows.some((row) => row[0] === 'Kein Boot wiederholt sich über die gesamte Regatta.')).toBe(true)
  })

  it('shows the warning text verbatim when present', () => {
    const rows = buildCommitteeOverviewRows({ ...baseInput, warning: 'Ab Wettfahrt 4 kann eine Wiederholung nicht mehr vermieden werden.' })
    expect(rows.some((row) => row[0] === 'Ab Wettfahrt 4 kann eine Wiederholung nicht mehr vermieden werden.')).toBe(true)
  })

  it('builds a header row and one row per slot with race labels/boats aligned', () => {
    const rows = buildCommitteeOverviewRows(baseInput)
    const headerRow = rows.find((row) => row[0] === 'Los')
    expect(headerRow).toEqual(['Los', 'WF 1', 'WF 2'])
    expect(rows).toContainEqual(['Los 1', '1', '2'])
    expect(rows).toContainEqual(['Los 2', '2', '1'])
  })
})
