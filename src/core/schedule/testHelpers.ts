/** Cycle lengths of the permutation that turns prevRow into nextRow (both rows of equal length, same value set). */
export function transitionCycleLengths<T>(prevRow: T[], nextRow: T[]): number[] {
  const n = prevRow.length
  const positionOfValue = new Map<T, number>()
  prevRow.forEach((value, idx) => positionOfValue.set(value, idx))
  const perm = nextRow.map((value) => {
    const idx = positionOfValue.get(value)
    if (idx === undefined) throw new Error('nextRow contains a value absent from prevRow')
    return idx
  })

  const visited = new Array(n).fill(false)
  const lengths: number[] = []
  for (let start = 0; start < n; start++) {
    if (visited[start]) continue
    let length = 0
    let cur = start
    while (!visited[cur]) {
      visited[cur] = true
      cur = perm[cur]
      length++
    }
    lengths.push(length)
  }
  return lengths
}

export function isBijection<T>(row: T[], n: number): boolean {
  return row.length === n && new Set(row).size === n
}

/** Physically valid on-water transition: fixed-point-free, disjoint pairs, +exactly one triangle iff n is odd. */
export function isValidSwapTransition<T>(prevRow: T[], nextRow: T[], n: number): boolean {
  const lengths = transitionCycleLengths(prevRow, nextRow).sort((a, b) => a - b)
  if (lengths.some((len) => len === 1)) return false
  if (n % 2 === 0) return lengths.every((len) => len === 2)
  const triangleCount = lengths.filter((len) => len === 3).length
  const pairCount = lengths.filter((len) => len === 2).length
  return triangleCount === 1 && pairCount * 2 + 3 === n
}
