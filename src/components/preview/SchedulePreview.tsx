import { Link } from 'react-router-dom'
import { useScheduleStore } from '../../state/useScheduleStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ScheduleTable } from './ScheduleTable'
import { WarningBanner } from './WarningBanner'

export function SchedulePreview() {
  const result = useScheduleStore((s) => s.result)
  const reroll = useScheduleStore((s) => s.reroll)

  if (!result) {
    return (
      <Card className="text-sm text-gray-600">
        Noch kein Plan erzeugt — bitte links die Konfiguration ausfüllen, um eine Vorschau zu sehen.
      </Card>
    )
  }

  const slotLabels = result.boatLabels.map((_, i) => `Los ${i + 1}`)
  const raceLabels = Array.from({ length: result.raceCount }, (_, i) => `WF ${i + 1}`)

  return (
    <Card className="space-y-4">
      <WarningBanner warning={result.warning} />
      <div className="overflow-x-auto">
        <ScheduleTable slotLabels={slotLabels} raceLabels={raceLabels} bySlot={result.bySlot} />
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={reroll}>
          Neu auslosen
        </Button>
        <Link to="/lottery-slips">
          <Button type="button">Los-Zettel drucken</Button>
        </Link>
        <Link to="/committee-overview">
          <Button type="button" variant="secondary">
            Übersicht für Wettfahrtleitung drucken
          </Button>
        </Link>
      </div>
    </Card>
  )
}
