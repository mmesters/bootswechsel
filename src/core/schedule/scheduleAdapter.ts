import type { BoatId } from './types'
import { buildSchedule } from './buildSchedule'
import { transpose } from './transpose'

export interface ScheduleResult {
  /** byRace[raceIndex][slot] -> boat label. What the committee overview needs. */
  byRace: BoatId[][]
  /** bySlot[slot][raceIndex] -> boat label. What a single lottery slip needs. */
  bySlot: BoatId[][]
  warning: string | null
  seed: number
  boatLabels: BoatId[]
  raceCount: number
  generatedAt: string
}

/** Runs buildSchedule and normalizes its output into both orientations the UI needs. */
export function generateScheduleResult(boatLabels: BoatId[], raceCount: number, seed: number): ScheduleResult {
  const { rows, warning } = buildSchedule(boatLabels.length, raceCount, boatLabels, seed)
  return {
    byRace: rows,
    bySlot: transpose(rows),
    warning,
    seed,
    boatLabels,
    raceCount,
    generatedAt: new Date().toISOString(),
  }
}
