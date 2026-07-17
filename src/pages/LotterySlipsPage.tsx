import { Link } from 'react-router-dom'
import { LotterySlipsSheet } from '../components/print/LotterySlipsSheet'
import { PrintToolbar } from '../components/print/PrintToolbar'
import { useScheduleStore } from '../state/useScheduleStore'

export function LotterySlipsPage() {
  const result = useScheduleStore((s) => s.result)
  const regattaName = useScheduleStore((s) => s.regattaName)

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

  const raceLabels = Array.from({ length: result.raceCount }, (_, i) => `Wettfahrt ${i + 1}`)

  return (
    <div>
      <PrintToolbar />
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-900">{regattaName.trim() || 'Bootswechsel'}</h1>
        <p className="text-sm text-gray-600">Los-Zettel</p>
      </div>
      <LotterySlipsSheet bySlot={result.bySlot} raceLabels={raceLabels} warning={result.warning} />
    </div>
  )
}
