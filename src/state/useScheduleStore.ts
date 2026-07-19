import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { randomSeed } from '../core/schedule/rng'
import { generateScheduleResult, type ScheduleResult } from '../core/schedule/scheduleAdapter'

/** The raw (unvalidated, string-based) config form field values, persisted so the form can
 *  restore itself when ConfigForm remounts (e.g. navigating to /lottery-slips and back) instead
 *  of resetting to hardcoded defaults and silently regenerating a different plan. */
export interface ScheduleFormConfig {
  customNumbering: boolean
  teamCount: string
  boatListRaw: string
  raceCount: string
}

interface ScheduleStore {
  result: ScheduleResult | null
  /** Free-text regatta name, purely display metadata — shown as a heading on print views and the XLSX export. */
  regattaName: string
  /** Last known raw form config, so a remounted ConfigForm can restore its fields. */
  config: ScheduleFormConfig | null
  /** Validates nothing itself — call with already-validated data (see configFormSchema). */
  generate: (boatLabels: string[], raceCount: number) => void
  /** Re-draws race 1 with a new random seed, keeping the same boats/race count. */
  reroll: () => void
  reset: () => void
  setRegattaName: (name: string) => void
  setConfig: (config: ScheduleFormConfig) => void
}

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set, get) => ({
      result: null,
      regattaName: '',
      config: null,
      generate: (boatLabels, raceCount) => {
        set({ result: generateScheduleResult(boatLabels, raceCount, randomSeed()) })
      },
      reroll: () => {
        const current = get().result
        if (!current) return
        set({ result: generateScheduleResult(current.boatLabels, current.raceCount, randomSeed()) })
      },
      reset: () => set({ result: null, regattaName: '', config: null }),
      setRegattaName: (name) => set({ regattaName: name }),
      setConfig: (config) => set({ config }),
    }),
    { name: 'bootswechsel:last' },
  ),
)
