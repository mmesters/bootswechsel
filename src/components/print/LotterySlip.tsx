interface LotterySlipProps {
  slotNumber: number
  boatsByRace: string[]
  raceLabels: string[]
  warning: string | null
}

export function LotterySlip({ slotNumber, boatsByRace, raceLabels, warning }: LotterySlipProps) {
  return (
    <div className="break-inside-avoid rounded-md border border-dashed border-gray-400 p-4">
      <p className="mb-2 text-xs font-semibold tracking-wide text-tum-blue uppercase">Los Nr. {slotNumber}</p>
      <ul className="space-y-1 text-sm">
        {raceLabels.map((label, i) => (
          <li key={label} className="flex justify-between border-b border-gray-100 py-0.5 last:border-0">
            <span className="text-gray-600">{label}</span>
            <span className="font-semibold tabular-nums">Boot {boatsByRace[i]}</span>
          </li>
        ))}
      </ul>
      {warning && <p className="mt-2 text-[10px] leading-tight text-tum-orange">{warning}</p>}
    </div>
  )
}
