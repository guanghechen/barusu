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
  /**
   * Whether is a blank character
   */
  blank: boolean
  /**
   * Whether is a punctuation character
   */
  punctuation: boolean
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
   * Total number of blank characters
   */
  blankTotal: number
  /**
   * Total number of punctuation characters
   */
  punctuationTotal: number
  /**
   * Total number of characters after deduplication
   */
  uniqueTotal: number
  /**
   * Total number of blank characters after deduplication
   */
  uniqueBlankTotal: number
  /**
   * Total number of punctuation characters after deduplication
   */
  uniquePunctuationTotal: number
  /**
   * Word frequency statistics of characters
   */
  details?: CharacterDetail[]
}


/**
 * Perform character statistics on given string
 *
 * @param content
 */
export function performCharacterStatistics(
  content: string,
): Record<string, CharacterDetail> {
  const detailMap: Record<string, CharacterDetail> = {}
  for (const c of content) {
    let detail = detailMap[c]
    if (detail != null) {
      detail.count += 1
      continue
    }

    detail = {
      char: c,
      count: 1,
      blank: /\s/u.test(c),
      punctuation: /\p{P}/u.test(c),
    }
    detailMap[c] = detail
  }
  return detailMap
}


/**
 * Merge @detailMap into @result
 *
 * @param detailMap
 * @param result
 */
export function mergeCharacterStat(
  detailMap: Record<string, CharacterDetail>,
  result: Record<string, CharacterDetail>,
): void {
  for (const detail of Object.values(detailMap)) {
    const x = result[detail.char]
    if (x != null) {
      x.count += detail.count
      continue
    }
    // eslint-disable-next-line no-param-reassign
    result[detail.char] = detail
  }
}


/**
 * Map Record<string, CharacterDetail> to CharacterStat
 * @param detailMap
 */
export function calcCharacterStat(
  detailMap: Record<string, CharacterDetail>,
  topOfDetails: number,
): CharacterStat {
  let total = 0, blankTotal = 0, punctuationTotal = 0
  let uniqueTotal = 0, uniqueBlankTotal = 0, uniquePunctuationTotal = 0
  for (const detail of Object.values(detailMap)) {
    total += detail.count
    uniqueTotal += 1
    if (detail.blank) {
      blankTotal += detail.count
      uniqueBlankTotal += 1
    }
    if (detail.punctuation) {
      punctuationTotal += detail.count
      uniquePunctuationTotal += 1
    }
  }

  const result: CharacterStat = {
    total,
    blankTotal,
    punctuationTotal,
    uniqueTotal,
    uniqueBlankTotal,
    uniquePunctuationTotal,
  }

  if (topOfDetails > 0) {
    const details: CharacterDetail[] = Object.values(detailMap)
      .sort((x, y) => {
        if (x.count !== y.count) return y.count - x.count
        return x < y ? -1 : 1
      })
      .slice(0, topOfDetails)
    result.details = details
  }

  return result
}


/**
 * Print CharacterStat
 * @param stat
 */
export function printCharacterStat(stat: CharacterStat): void {
  const length = stat.total.toString().length
  const format = (n: number) => n.toString().padStart(length)
  console.log('======================================================')
  console.log('                   total:', format(stat.total))
  console.log('             blank total:', format(stat.blankTotal))
  console.log('       punctuation total:', format(stat.punctuationTotal))
  console.log('            unique total:', format(stat.uniqueTotal))
  console.log('      unique blank total:', format(stat.uniqueBlankTotal))
  console.log('unique punctuation total:', format(stat.uniquePunctuationTotal))

  if (stat.details != null) {
    console.log('                 details:')
    console.log('                 -----------------------')
    for (const detail of stat.details) {
      console.log(JSON.stringify(detail.char).padStart(23) + ':' +  format(detail.count))
    }
  }
  console.log()
}
