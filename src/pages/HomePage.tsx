import { ConfigForm } from '../components/config/ConfigForm'
import { SchedulePreview } from '../components/preview/SchedulePreview'
import { Card } from '../components/ui/Card'

export function HomePage() {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(280px,360px)_1fr]">
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Konfiguration</h2>
        <ConfigForm />
      </Card>
      <SchedulePreview />
    </div>
  )
}
