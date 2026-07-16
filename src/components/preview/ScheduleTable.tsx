import { cn } from '../../lib/cn'

interface ScheduleTableProps {
  slotLabels: string[]
  raceLabels: string[]
  bySlot: string[][]
}

/** Rows = slots (up to 30), columns = races (usually <=6) — the other way round would be unreadable on A4. */
export function ScheduleTable({ slotLabels, raceLabels, bySlot }: ScheduleTableProps) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-tum-blue px-3 py-2 text-left font-semibold text-white">Los</th>
          {raceLabels.map((label) => (
            <th
              key={label}
              className="border border-gray-300 bg-tum-blue px-3 py-2 text-center font-semibold text-white"
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {slotLabels.map((slotLabel, slotIndex) => (
          <tr key={slotLabel} className={cn('break-inside-avoid', slotIndex % 2 === 1 && 'bg-gray-50')}>
            <td className="border border-gray-300 px-3 py-2 font-semibold tabular-nums">{slotLabel}</td>
            {bySlot[slotIndex].map((boat, raceIndex) => (
              <td key={raceIndex} className="border border-gray-300 px-3 py-2 text-center tabular-nums">
                {boat}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
