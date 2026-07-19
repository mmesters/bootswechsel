import { beforeEach, describe, expect, it } from 'vitest'
import { useScheduleStore } from './useScheduleStore'

beforeEach(() => {
  window.localStorage.clear()
  useScheduleStore.getState().reset()
})

describe('useScheduleStore', () => {
  it('generate() populates a result matching the given boats/race count', () => {
    useScheduleStore.getState().generate(['1', '2', '3', '4'], 3)
    const { result } = useScheduleStore.getState()
    expect(result).not.toBeNull()
    expect(result?.boatLabels).toEqual(['1', '2', '3', '4'])
    expect(result?.raceCount).toBe(3)
    expect(result?.byRace).toHaveLength(3)
  })

  it('reroll() keeps config but changes the seed and reshuffles race 1', () => {
    useScheduleStore.getState().generate(['1', '2', '3', '4', '5', '6', '7', '8'], 3)
    const first = useScheduleStore.getState().result
    useScheduleStore.getState().reroll()
    const second = useScheduleStore.getState().result

    expect(second?.boatLabels).toEqual(first?.boatLabels)
    expect(second?.raceCount).toBe(first?.raceCount)
    expect(second?.seed).not.toBe(first?.seed)
  })

  it('reroll() is a no-op when there is no result yet', () => {
    useScheduleStore.getState().reroll()
    expect(useScheduleStore.getState().result).toBeNull()
  })

  it('reset() clears the result', () => {
    useScheduleStore.getState().generate(['1', '2'], 2)
    useScheduleStore.getState().reset()
    expect(useScheduleStore.getState().result).toBeNull()
  })

  it('persists the result to localStorage', () => {
    useScheduleStore.getState().generate(['1', '2'], 2)
    const stored = window.localStorage.getItem('bootswechsel:last')
    expect(stored).not.toBeNull()
    expect(JSON.parse(stored ?? '{}').state.result.boatLabels).toEqual(['1', '2'])
  })

  it('setRegattaName() updates and persists the regatta name', () => {
    useScheduleStore.getState().setRegattaName('Vereinsregatta 2026')
    expect(useScheduleStore.getState().regattaName).toBe('Vereinsregatta 2026')
    const stored = window.localStorage.getItem('bootswechsel:last')
    expect(JSON.parse(stored ?? '{}').state.regattaName).toBe('Vereinsregatta 2026')
  })

  it('reset() also clears the regatta name', () => {
    useScheduleStore.getState().setRegattaName('Vereinsregatta 2026')
    useScheduleStore.getState().reset()
    expect(useScheduleStore.getState().regattaName).toBe('')
  })

  it('setConfig() updates and persists the raw form config', () => {
    const config = { customNumbering: false, teamCount: '12', boatListRaw: '', raceCount: '5' }
    useScheduleStore.getState().setConfig(config)
    expect(useScheduleStore.getState().config).toEqual(config)
    const stored = window.localStorage.getItem('bootswechsel:last')
    expect(JSON.parse(stored ?? '{}').state.config).toEqual(config)
  })

  it('reset() also clears the config', () => {
    useScheduleStore.getState().setConfig({ customNumbering: false, teamCount: '12', boatListRaw: '', raceCount: '5' })
    useScheduleStore.getState().reset()
    expect(useScheduleStore.getState().config).toBeNull()
  })
})
