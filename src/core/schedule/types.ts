/** A boat identifier as entered/displayed to the user (not necessarily numeric or contiguous). */
export type BoatId = string

/** A team's fixed position across the whole regatta (0-based); what a lottery slip corresponds to. */
export type Slot = number

/** One race's assignment, indexed by boat *index* (0..n-1) into the resolved boat list, not by label. */
export type IndexRow = number[]

export interface BuildScheduleResult {
  /** rows[raceIndex][slot] = boat label for that race and slot. Always r rows of n labels each. */
  rows: BoatId[][]
  /** null if no repeat was necessary; otherwise a German, round-number-specific explanation. */
  warning: string | null
}
