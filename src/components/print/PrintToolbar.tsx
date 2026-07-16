import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export function PrintToolbar() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <Link to="/" className="text-sm text-tum-blue hover:underline">
        ← Zurück zur Konfiguration
      </Link>
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-500">
          Tipp: Deaktivieren Sie in den Druckoptionen unter „Weitere Einstellungen“ die Option „Kopf- und
          Fußzeilen“ für ein sauberes Ergebnis.
        </p>
        <Button type="button" onClick={() => window.print()}>
          Drucken
        </Button>
      </div>
    </div>
  )
}
