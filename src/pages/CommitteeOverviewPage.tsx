import { Link } from 'react-router-dom'
import { CommitteeOverviewTable } from '../components/print/CommitteeOverviewTable'
import { PrintToolbar } from '../components/print/PrintToolbar'
import { useScheduleStore } from '../state/useScheduleStore'

export function CommitteeOverviewPage() {
  const result = useScheduleStore((s) => s.result)

  if (!result) {
    return (
      <p className="text-sm text-gray-600">
        Es liegt noch kein Plan vor.{' '}
        <Link to="/" className="text-tum-blue hover:underline">
          Bitte zuerst eine Regatta konfigurieren.
        </Link>
      </p>
    )
  }

  const slotLabels = result.boatLabels.map((_, i) => `Los ${i + 1}`)
  const raceLabels = Array.from({ length: result.raceCount }, (_, i) => `WF ${i + 1}`)

  return (
    <div>
      <PrintToolbar />
      <CommitteeOverviewTable
        slotLabels={slotLabels}
        raceLabels={raceLabels}
        bySlot={result.bySlot}
        warning={result.warning}
        generatedAt={result.generatedAt}
        seed={result.seed}
      />
    </div>
  )
}
