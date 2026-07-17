import { Link } from 'react-router-dom'
import { downloadCommitteeOverviewXlsx } from '../../core/export/committeeOverviewXlsx'
import { useScheduleStore } from '../../state/useScheduleStore'
import { CommitteeOverviewTable } from '../print/CommitteeOverviewTable'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export function SchedulePreview() {
  const result = useScheduleStore((s) => s.result)
  const regattaName = useScheduleStore((s) => s.regattaName)
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
    <Card className="space-y-4 print:w-full print:border-0 print:p-0 print:shadow-none">
      <CommitteeOverviewTable
        regattaName={regattaName}
        slotLabels={slotLabels}
        raceLabels={raceLabels}
        bySlot={result.bySlot}
        warning={result.warning}
        generatedAt={result.generatedAt}
        seed={result.seed}
      />
      <div className="flex flex-wrap items-center gap-3 pt-2 print:hidden">
        <Button type="button" variant="secondary" onClick={reroll}>
          Neu auslosen
        </Button>
        <Link to="/lottery-slips">
          <Button type="button">Los-Zettel drucken</Button>
        </Link>
        <Button type="button" variant="secondary" onClick={() => window.print()}>
          Übersicht drucken
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            downloadCommitteeOverviewXlsx({
              regattaName,
              raceLabels,
              slotLabels,
              bySlot: result.bySlot,
              warning: result.warning,
              generatedAt: result.generatedAt,
              seed: result.seed,
            })
          }
        >
          Als Excel (.xlsx) herunterladen
        </Button>
      </div>
    </Card>
  )
}
