import { absoluteOfWorkspace, relativeOfWorkspace } from '@barusu/util-cli'
import fs from 'fs-extra'
import globby from 'globby'
import path from 'path'
import { createMatchPath } from 'tsconfig-paths'
import { logger } from '../../env/logger'
import { correctModulePath } from '../../util/module-path'
import type { TsconfigPathsContext } from './context'

export class TsconfigPathsProcessor {
  protected readonly context: TsconfigPathsContext

  constructor(context: TsconfigPathsContext) {
    this.context = context
  }

  public async process(): Promise<void> {
    const { context } = this

    // no path alias used
    if (context.tsconfigBaseUrl == null || context.tsconfigPathAlias == null)
      return

    const paths = context.tsconfigPathAlias
    const absoluteBaseUrl = path.resolve(
      context.workspace,
      context.tsconfigBaseUrl,
    )
    const extensions = Object.keys(require.extensions).concat(['.ts', '.d.ts'])

    // transform path alias
    const match = createMatchPath(absoluteBaseUrl, paths)
    const transform = (
      dstFilepath: string,
      requiredFilePath: string,
    ): string => {
      const resolvedPath: string | undefined = match(
        requiredFilePath,
        undefined,
        undefined,
        extensions,
      )
      if (resolvedPath == null) return requiredFilePath

      const srcFilepath = absoluteOfWorkspace(
        context.srcRootDir,
        relativeOfWorkspace(context.dstRootDir, dstFilepath),
      )
      const relativeRequiredFilepath = path.relative(
        path.dirname(srcFilepath),
        resolvedPath,
      )
      const resolvedModulePath: string = path
        .normalize(relativeRequiredFilepath)
        .replace(/^([^.])/, '.' + path.sep + '$1')

      logger.verbose(
        `[processDts] correct module: (${requiredFilePath}) => (${resolvedModulePath})`,
      )
      return resolvedModulePath
    }

    // process single *.d.ts file
    const processFile = async (filePath: string): Promise<void> => {
      const content: string = await fs.readFile(filePath, context.encoding)
      const resolvedContent: string = correctModulePath(
        content,
        (modulePath: string) => transform(filePath, modulePath),
      )
      await fs.writeFile(filePath, resolvedContent, context.encoding)
    }

    const files: string[] = await globby(context.pattern, {
      cwd: context.workspace,
      onlyFiles: true,
      expandDirectories: false,
    })

    for (const filepath of files) {
      const absoluteFilepath = path.resolve(context.workspace, filepath)
      await processFile(absoluteFilepath)
    }
  }
}
