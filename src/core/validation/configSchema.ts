import { z } from 'zod'
import { parseBoatLabels } from '../boatLabels/parseBoatLabels'

export const MIN_TEAMS = 2
export const MAX_TEAMS = 30
export const TYPICAL_MAX_RACES = 6
export const MAX_RACES = 50

export const configFormSchema = z
  .object({
    mode: z.enum(['count', 'list']),
    teamCount: z.coerce.number().int().optional(),
    boatListRaw: z.string().optional(),
    raceCount: z.coerce.number().int(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'count') {
      if (data.teamCount === undefined || Number.isNaN(data.teamCount)) {
        ctx.addIssue({
          code: 'custom',
          path: ['teamCount'],
          message: 'Bitte eine Anzahl an Booten/Teams eingeben.',
        })
      } else if (data.teamCount < MIN_TEAMS || data.teamCount > MAX_TEAMS) {
        ctx.addIssue({
          code: 'custom',
          path: ['teamCount'],
          message: `Die Anzahl der Boote/Teams muss zwischen ${MIN_TEAMS} und ${MAX_TEAMS} liegen.`,
        })
      }
    } else {
      const { labels, duplicates } = parseBoatLabels(data.boatListRaw ?? '')
      if (duplicates.length > 0) {
        const quoted = duplicates.map((d) => `„${d}“`).join(', ')
        ctx.addIssue({
          code: 'custom',
          path: ['boatListRaw'],
          message: `Boot${duplicates.length > 1 ? 'e' : ''} ${quoted} ${
            duplicates.length > 1 ? 'sind' : 'ist'
          } mehrfach angegeben. Jede Bootskennung darf nur einmal vorkommen.`,
        })
      } else if (labels.length < MIN_TEAMS || labels.length > MAX_TEAMS) {
        ctx.addIssue({
          code: 'custom',
          path: ['boatListRaw'],
          message: `Es müssen zwischen ${MIN_TEAMS} und ${MAX_TEAMS} eindeutige Bootskennungen angegeben werden (aktuell: ${labels.length}).`,
        })
      }
    }

    if (data.raceCount === undefined || Number.isNaN(data.raceCount) || data.raceCount < 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['raceCount'],
        message: 'Die Anzahl der Wettfahrten muss mindestens 1 betragen.',
      })
    } else if (data.raceCount > MAX_RACES) {
      ctx.addIssue({
        code: 'custom',
        path: ['raceCount'],
        message: `Die Anzahl der Wettfahrten darf ${MAX_RACES} nicht überschreiten.`,
      })
    }
  })

export type ConfigFormInput = z.infer<typeof configFormSchema>

/** Resolves the validated form input into the ordered boat-label list buildSchedule needs. */
export function resolveBoatLabels(data: ConfigFormInput): string[] {
  if (data.mode === 'count') {
    return Array.from({ length: data.teamCount ?? 0 }, (_, i) => String(i + 1))
  }
  return parseBoatLabels(data.boatListRaw ?? '').labels
}

/** Non-blocking heads-up, not a validation error: races beyond ~6 are unusual for a regatta day. */
export function isRaceCountUnusuallyHigh(raceCount: number): boolean {
  return raceCount > TYPICAL_MAX_RACES
}
