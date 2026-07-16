import { describe, expect, it } from 'vitest'
import { parseBoatLabels } from './parseBoatLabels'

describe('parseBoatLabels', () => {
  it('splits on commas', () => {
    expect(parseBoatLabels('3,7,12').labels).toEqual(['3', '7', '12'])
  })

  it('splits on semicolons and newlines, and mixed separators', () => {
    expect(parseBoatLabels('3;7\n12,15').labels).toEqual(['3', '7', '12', '15'])
  })

  it('trims whitespace around tokens', () => {
    expect(parseBoatLabels('  3 , 7  ,12  ').labels).toEqual(['3', '7', '12'])
  })

  it('ignores empty tokens from trailing/duplicate separators', () => {
    expect(parseBoatLabels('3,,7,\n,12,').labels).toEqual(['3', '7', '12'])
  })

  it('returns empty result for blank input', () => {
    expect(parseBoatLabels('   \n  ,, ')).toEqual({ labels: [], duplicates: [] })
  })

  it('accepts non-contiguous and alphanumeric labels', () => {
    expect(parseBoatLabels('A7, 21, Boot-3, 999').labels).toEqual(['A7', '21', 'Boot-3', '999'])
  })

  it('detects duplicates and reports each duplicate value once', () => {
    const result = parseBoatLabels('3, 7, 3, 12, 7, 7')
    expect(result.labels).toEqual(['3', '7', '12'])
    expect(result.duplicates).toEqual(['3', '7'])
  })
})
