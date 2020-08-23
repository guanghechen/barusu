/**
 * Word character frequency statistics of single character
 */
export interface CharacterDetail {
  /**
   * The character
   */
  char: string
  /**
   * Number of occurrences of the character
   */
  count: number
}


/**
 * Statistics of characters
 */
export interface CharacterStat {
  /**
   * Total characters
   */
  total: number
  /**
   * Total number of non-blank characters
   */
  nonBlankTotal: number
  /**
   * Total number of characters after deduplication
   */
  uniqueTotal: number
  /**
   * Total number of non-blank characters after deduplication
   */
  uniqueNonBlankTotal: number
  /**
   * Word frequency statistics of characters
   */
  details: CharacterDetail[]
}


/**
 *
 * @param s
 */
export function performCharacterStatistics(s: string): CharacterStat {
  let total = 0, nonBlankTotal = 0
  const countMap: Record<string, number> = {}
  for (const c of s) {
    const cnt = countMap[c] || 0
    countMap[c] = cnt + 1
    total += 1
    if (!/\s/.test(c)) nonBlankTotal += 1
  }

  const uniqueCharacters: string[] = Object.keys(countMap).sort((x, y) => countMap[y] - countMap[x])
  const uniqueNonBlankCharacters: string[] = uniqueCharacters.filter(c => !/\s/.test(c))
  const details = uniqueCharacters.map((c): CharacterDetail => ({
    char: c,
    count: countMap[c],
  }))

  return {
    total,
    nonBlankTotal,
    uniqueTotal: uniqueCharacters.length,
    uniqueNonBlankTotal: uniqueNonBlankCharacters.length,
    details,
  }
}
