import { LotterySlip } from './LotterySlip'

interface LotterySlipsSheetProps {
  bySlot: string[][]
  raceLabels: string[]
  warning: string | null
}

/** One slip per slot, 2 per row, meant to be cut apart along the dashed borders and folded for the urn. */
export function LotterySlipsSheet({ bySlot, raceLabels, warning }: LotterySlipsSheetProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {bySlot.map((boatsByRace, index) => (
        <LotterySlip
          key={index}
          slotNumber={index + 1}
          boatsByRace={boatsByRace}
          raceLabels={raceLabels}
          warning={warning}
        />
      ))}
    </div>
  )
}
