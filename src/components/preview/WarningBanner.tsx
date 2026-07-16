export function WarningBanner({ warning }: { warning: string | null }) {
  if (!warning) {
    return (
      <p className="rounded-md border border-tum-green/40 bg-tum-green/10 px-4 py-3 text-sm text-gray-800">
        <span className="font-semibold text-tum-green">Kein Boot wiederholt sich</span> über die gesamte Regatta.
      </p>
    )
  }

  return (
    <p className="rounded-md border border-tum-orange/40 bg-tum-orange/10 px-4 py-3 text-sm text-gray-800">
      <span className="font-semibold text-tum-orange">Hinweis:</span> {warning}
    </p>
  )
}
