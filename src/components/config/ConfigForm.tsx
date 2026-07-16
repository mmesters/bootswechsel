import { useEffect, useRef } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { cn } from '../../lib/cn'
import {
  configFormSchema,
  isRaceCountUnusuallyHigh,
  MAX_RACES,
  MAX_TEAMS,
  MIN_TEAMS,
  resolveBoatLabels,
  TYPICAL_MAX_RACES,
} from '../../core/validation/configSchema'
import { useScheduleStore } from '../../state/useScheduleStore'
import { FieldError } from '../ui/FieldError'

interface RawFormValues {
  mode: 'count' | 'list'
  teamCount: string
  boatListRaw: string
  raceCount: string
}

const DEFAULT_VALUES: RawFormValues = {
  mode: 'count',
  teamCount: '8',
  boatListRaw: '',
  raceCount: '4',
}

const RECOMPUTE_DEBOUNCE_MS = 250

/** Wraps configFormSchema as a react-hook-form resolver without fighting zod's coerce-input typing. */
const resolver: Resolver<RawFormValues> = (values) => {
  const result = configFormSchema.safeParse(values)
  if (result.success) return { values, errors: {} }
  const errors: Record<string, { type: string; message: string }> = {}
  for (const issue of result.error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) errors[path] = { type: 'validation', message: issue.message }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { values: {}, errors: errors as any }
}

export function ConfigForm() {
  const generate = useScheduleStore((s) => s.generate)
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<RawFormValues>({
    resolver,
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  })

  const values = watch()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const result = configFormSchema.safeParse(values)
      if (!result.success) return
      generate(resolveBoatLabels(result.data), result.data.raceCount)
    }, RECOMPUTE_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.mode, values.teamCount, values.boatListRaw, values.raceCount, generate])

  const mode = values.mode
  const raceCountNumber = Number(values.raceCount)

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div>
        <span className="mb-2 block text-sm font-medium text-gray-700">Boote / Teams</span>
        <div className="inline-flex rounded-md border border-gray-300 p-1">
          <label
            className={cn(
              'cursor-pointer rounded px-3 py-1.5 text-sm transition-colors',
              mode === 'count' ? 'bg-tum-blue text-white' : 'text-gray-700 hover:bg-gray-50',
            )}
          >
            <input type="radio" value="count" className="sr-only" {...register('mode')} />
            Anzahl
          </label>
          <label
            className={cn(
              'cursor-pointer rounded px-3 py-1.5 text-sm transition-colors',
              mode === 'list' ? 'bg-tum-blue text-white' : 'text-gray-700 hover:bg-gray-50',
            )}
          >
            <input type="radio" value="list" className="sr-only" {...register('mode')} />
            Liste
          </label>
        </div>
      </div>

      {mode === 'count' ? (
        <div>
          <label htmlFor="teamCount" className="mb-1 block text-sm font-medium text-gray-700">
            Anzahl Boote/Teams ({MIN_TEAMS}–{MAX_TEAMS})
          </label>
          <input
            id="teamCount"
            type="number"
            inputMode="numeric"
            min={MIN_TEAMS}
            max={MAX_TEAMS}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm tabular-nums focus:border-tum-blue focus:ring-1 focus:ring-tum-blue focus:outline-none"
            {...register('teamCount')}
          />
          <FieldError message={errors.teamCount?.message} />
        </div>
      ) : (
        <div>
          <label htmlFor="boatListRaw" className="mb-1 block text-sm font-medium text-gray-700">
            Bootsnummern ({MIN_TEAMS}–{MAX_TEAMS}, getrennt durch Komma, Semikolon oder Zeilenumbruch)
          </label>
          <textarea
            id="boatListRaw"
            rows={3}
            placeholder="z. B. 3, 7, 12, 15, 21, 30"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm tabular-nums focus:border-tum-blue focus:ring-1 focus:ring-tum-blue focus:outline-none"
            {...register('boatListRaw')}
          />
          <FieldError message={errors.boatListRaw?.message} />
        </div>
      )}

      <div>
        <label htmlFor="raceCount" className="mb-1 block text-sm font-medium text-gray-700">
          Anzahl Wettfahrten
        </label>
        <input
          id="raceCount"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_RACES}
          className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm tabular-nums focus:border-tum-blue focus:ring-1 focus:ring-tum-blue focus:outline-none"
          {...register('raceCount')}
        />
        <FieldError message={errors.raceCount?.message} />
        {!errors.raceCount && isRaceCountUnusuallyHigh(raceCountNumber) && (
          <p className="mt-1 text-sm text-gray-600">
            Hinweis: Mehr als {TYPICAL_MAX_RACES} Wettfahrten sind an einem Regattatag ungewöhnlich.
          </p>
        )}
      </div>
    </form>
  )
}
