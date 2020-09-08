/**
 *
 */
export interface ModuleRankItem {
  /**
   * Regex pattern of module
   */
  regex: RegExp
  /**
   * Rank of the module matched this.regex
   */
  rank: number
}


export const defaultModuleRankItems: ModuleRankItem[] = [
  { // npm package
    regex: /^[a-zA-Z\d][\w\-.]*/,
    rank: 1.1,
  },
  { // npm scoped package
    regex: /^@[a-zA-Z\d][\w\-.]*\/[a-zA-Z\d][\w\-.]*/,
    rank: 1.2,
  },
  { // paths alias
    regex: /^@\//,
    rank: 2.1,
  },
  { // absolute path
    regex: /^(?:\/|[a-zA-Z]:)/,
    rank: 3.1,
  },
  { // relative path (parent)
    regex: /^[.]{2}[\/\\][^\n]*/,
    rank: 3.2,
  },
  { // relative path
    regex: /^[.][\/\\][^\n]*/,
    rank: 3.3,
  }
]


/**
 * Compare the two module paths and determine which one should be ranked first
 * @param p1          path of module1
 * @param p2          path of module2
 * @param moduleItems module priority infos
 */
export function compareModulePath(
  p1: string,
  p2: string,
  moduleItems: ModuleRankItem[]
): number {
  if (p1 === p2) return 0
  let rankOfP1: number | null = null
  let rankOfP2: number | null = null

  for (const moduleItem of moduleItems) {
    if (rankOfP1 == null && moduleItem.regex.test(p1)) {
      rankOfP1 = moduleItem.rank
    }
    if (rankOfP2 == null && moduleItem.regex.test(p2)) {
      rankOfP2 = moduleItem.rank
    }
  }

  /**
   * If there is only one specified rank in p1 and p2, the one assigned the
   * rank will take precedence.
   *
   * Otherwise, If Both the rank of p1 and p2 are not specified or specified
   * with same rank, then just simply compare their lexicographic order
   */
  if (rankOfP1 != null) {
    if (rankOfP2 == null) return -1
    if (rankOfP1 === rankOfP2) return p1 < p2 ? -1 : 1
    return rankOfP1 < rankOfP2 ? -1 : 1
  }
  if (rankOfP2 != null) return 1
  return p1 < p2 ? -1 : 1
}
