import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="print:hidden">
      <div className="h-1 bg-tum-blue" />
      <div className="mx-auto w-full max-w-4xl px-4 py-4">
        <Link to="/" className="text-xl font-semibold tracking-tight">
          <span className="text-tum-blue-dark">Boots</span>
          <span className="text-tum-blue">wechsel</span>
        </Link>
        <p className="text-sm text-gray-500">Faire Bootsrotation für Regatten</p>
      </div>
    </header>
  )
}
