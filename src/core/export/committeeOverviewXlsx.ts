export interface CommitteeOverviewExportInput {
  regattaName: string
  raceLabels: string[]
  slotLabels: string[]
  bySlot: string[][]
  warning: string | null
  generatedAt: string
  seed: number
}

/** Pure row-builder (array-of-arrays for a worksheet), kept separate from the browser download side effect so it's testable. */
export function buildCommitteeOverviewRows(input: CommitteeOverviewExportInput): (string | number)[][] {
  const { regattaName, raceLabels, slotLabels, bySlot, warning, generatedAt, seed } = input

  const rows: (string | number)[][] = []
  if (regattaName.trim()) rows.push([regattaName.trim()])
  rows.push(['Bootswechsel – Übersicht für die Wettfahrtleitung'])
  rows.push([`Erzeugt am ${new Date(generatedAt).toLocaleString('de-DE')} · Los-Seed ${seed}`])
  rows.push([warning ?? 'Kein Boot wiederholt sich über die gesamte Regatta.'])
  rows.push([])
  rows.push(['Los', ...raceLabels])
  slotLabels.forEach((slotLabel, i) => rows.push([slotLabel, ...bySlot[i]]))

  return rows
}

function sanitizeFilenamePart(name: string): string {
  return name
    .trim()
    .replace(/[^\p{L}\p{N}\- ]+/gu, '')
    .replace(/\s+/g, '-')
}

/**
 * Triggers a browser download of the committee overview as .xlsx. Not unit-tested (DOM/file-save
 * side effect). Loads the (fairly large) xlsx library lazily, only when actually needed, so it
 * doesn't inflate the main bundle everyone downloads just to see the schedule.
 */
export async function downloadCommitteeOverviewXlsx(input: CommitteeOverviewExportInput): Promise<void> {
  const XLSX = await import('xlsx')
  const rows = buildCommitteeOverviewRows(input)
  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  worksheet['!cols'] = [{ wch: 10 }, ...input.raceLabels.map(() => ({ wch: 10 }))]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Wettfahrtleitung')

  const namePart = sanitizeFilenamePart(input.regattaName)
  const filename = `Bootswechsel${namePart ? `-${namePart}` : ''}.xlsx`
  XLSX.writeFile(workbook, filename)
}
