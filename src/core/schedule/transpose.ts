/** rows[raceIndex][slot] -> bySlot[slot][raceIndex]. Both directions are the same operation. */
export function transpose<T>(matrix: T[][]): T[][] {
  if (matrix.length === 0) return []
  const rowCount = matrix.length
  const colCount = matrix[0].length
  const result: T[][] = Array.from({ length: colCount }, () => new Array(rowCount))
  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      result[c][r] = matrix[r][c]
    }
  }
  return result
}
