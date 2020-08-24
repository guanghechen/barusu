import fs from 'fs-extra'
import globby from 'globby'
import {
  CharacterDetail,
  calcCharacterStat,
  mergeCharacterStat,
  performCharacterStatistics,
  printCharacterStat,
} from '../../util/character-stats'
import { WordStatContext } from './context'


export class WordStatProcessor {
  protected readonly context: WordStatContext

  public constructor(context: WordStatContext) {
    this.context = context
  }

  public async stat(): Promise<void> {
    const { context } = this

    const filePaths = [
      ...context.filePath,
      ...await globby(context.filePattern, {
        cwd: context.workspace,
        onlyFiles: true,
        expandDirectories: false,
      }),
    ]

    console.log()

    const result: Record < string, CharacterDetail > = {}
    for (const filePath of filePaths) {
      const content = await fs.readFile(filePath, context.encoding)
      const detailMap = performCharacterStatistics(content)
      const stat = calcCharacterStat(detailMap, context.showDetails)

      // display statistics for each file
      if (!context.showSummaryOnly) {
        console.log(filePath)
        printCharacterStat(stat)
      }

      mergeCharacterStat(detailMap, result)
    }

    // Output summary
    const stat = calcCharacterStat(result, context.showDetails)
    console.log('Summary')
    printCharacterStat(stat)
  }
}
