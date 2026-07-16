import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { randomSeed } from '../core/schedule/rng'
import { generateScheduleResult, type ScheduleResult } from '../core/schedule/scheduleAdapter'

interface ScheduleStore {
  result: ScheduleResult | null
  /** Validates nothing itself — call with already-validated data (see configFormSchema). */
  generate: (boatLabels: string[], raceCount: number) => void
  /** Re-draws race 1 with a new random seed, keeping the same boats/race count. */
  reroll: () => void
  reset: () => void
}

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set, get) => ({
      result: null,
      generate: (boatLabels, raceCount) => {
        set({ result: generateScheduleResult(boatLabels, raceCount, randomSeed()) })
      },
      reroll: () => {
        const current = get().result
        if (!current) return
        set({ result: generateScheduleResult(current.boatLabels, current.raceCount, randomSeed()) })
      },
      reset: () => set({ result: null }),
    }),
    { name: 'bootswechsel:last' },
  ),
)
