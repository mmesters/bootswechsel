import { ScheduleTable } from '../preview/ScheduleTable'
import { WarningBanner } from '../preview/WarningBanner'

interface CommitteeOverviewTableProps {
  slotLabels: string[]
  raceLabels: string[]
  bySlot: string[][]
  warning: string | null
  generatedAt: string
  seed: number
}

export function CommitteeOverviewTable({
  slotLabels,
  raceLabels,
  bySlot,
  warning,
  generatedAt,
  seed,
}: CommitteeOverviewTableProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Bootswechsel — Übersicht für die Wettfahrtleitung</h1>
        <p className="text-xs text-gray-500">
          Erzeugt am {new Date(generatedAt).toLocaleString('de-DE')} · Los-Seed {seed}
        </p>
      </div>
      <WarningBanner warning={warning} />
      <ScheduleTable slotLabels={slotLabels} raceLabels={raceLabels} bySlot={bySlot} />
    </div>
  )
}
