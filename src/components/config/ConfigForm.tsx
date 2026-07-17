import { type ReactNode, useEffect, useRef } from 'react'
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
  regattaName: string
  customNumbering: boolean
  teamCount: string
  boatListRaw: string
  raceCount: string
}

const DEFAULT_VALUES: RawFormValues = {
  regattaName: '',
  customNumbering: false,
  teamCount: '8',
  boatListRaw: '',
  raceCount: '4',
}

const RECOMPUTE_DEBOUNCE_MS = 250

function toScheduleConfig(values: RawFormValues) {
  return {
    mode: values.customNumbering ? ('list' as const) : ('count' as const),
    teamCount: values.teamCount,
    boatListRaw: values.boatListRaw,
    raceCount: values.raceCount,
  }
}

/** Wraps configFormSchema as a react-hook-form resolver without fighting zod's coerce-input typing. */
const resolver: Resolver<RawFormValues> = (values) => {
  const result = configFormSchema.safeParse(toScheduleConfig(values))
  if (result.success) return { values, errors: {} }
  const errors: Record<string, { type: string; message: string }> = {}
  for (const issue of result.error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) errors[path] = { type: 'validation', message: issue.message }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { values: {}, errors: errors as any }
}

/** Collapses/expands a field with a CSS grid-rows transition instead of an abrupt show/hide. */
function Collapsible({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        'grid transition-all duration-200 ease-out',
        open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}

export function ConfigForm() {
  const generate = useScheduleStore((s) => s.generate)
  const setRegattaName = useScheduleStore((s) => s.setRegattaName)
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
    setRegattaName(values.regattaName)
  }, [values.regattaName, setRegattaName])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const result = configFormSchema.safeParse(toScheduleConfig(values))
      if (!result.success) return
      generate(resolveBoatLabels(result.data), result.data.raceCount)
    }, RECOMPUTE_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.customNumbering, values.teamCount, values.boatListRaw, values.raceCount, generate])

  const raceCountNumber = Number(values.raceCount)

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="regattaName" className="mb-1 block text-sm font-medium text-gray-700">
          Name der Regatta (optional)
        </label>
        <input
          id="regattaName"
          type="text"
          placeholder="z. B. Vereinsregatta 2026"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-tum-blue focus:ring-1 focus:ring-tum-blue focus:outline-none"
          {...register('regattaName')}
        />
      </div>

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
          disabled={values.customNumbering}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm tabular-nums focus:border-tum-blue focus:ring-1 focus:ring-tum-blue focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
          {...register('teamCount')}
        />
        <FieldError message={errors.teamCount?.message} />

        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 shrink-0 rounded border-gray-400 text-tum-blue focus:ring-1 focus:ring-tum-blue focus:ring-offset-0"
            {...register('customNumbering')}
          />
          Boote sind nicht durchgehend nummeriert
        </label>

        <Collapsible open={values.customNumbering}>
          <div className="pt-2">
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
        </Collapsible>
      </div>

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
