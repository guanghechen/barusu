import fs from 'fs-extra'
import globby from 'globby'
import { absoluteOfWorkspace, relativeOfWorkspace } from '@barusu/util-cli'
import {
  CharacterDetail,
  calcCharacterStat,
  formatCharacterStat,
  mergeCharacterStat,
  performCharacterStatistics,
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
      ...new Set(
        context.filePath
          .concat(
            await globby(context.filePattern, {
              cwd: context.workspace,
              onlyFiles: true,
              expandDirectories: false,
            }),
          )
          .map(p => absoluteOfWorkspace(context.workspace, p)),
      ),
    ].sort()

    console.log()

    const result: Record<string, CharacterDetail> = {}
    for (const filePath of filePaths) {
      const content = await fs.readFile(filePath, context.encoding)
      const detailMap = performCharacterStatistics(content)
      const stat = calcCharacterStat(
        detailMap,
        context.showDetails,
        context.showDetailsPretty,
      )

      // display statistics for each file
      if (!context.showSummaryOnly) {
        console.log(relativeOfWorkspace(context.cwd, filePath))
        console.log(formatCharacterStat(stat))
      }

      mergeCharacterStat(detailMap, result)
    }

    // Print Summary only when multiple files are counted
    // or showSummaryOnly is specified
    if (context.showSummaryOnly || filePaths.length > 1) {
      const stat = calcCharacterStat(
        result,
        context.showDetails,
        context.showDetailsPretty,
      )
      console.log('Summary')
      console.log(formatCharacterStat(stat))
    }
  }
}
