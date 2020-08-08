import nodePlop from 'node-plop'
import { runPlop } from '@barusu/util-cli'
import { resolveTemplateFilepath, version } from '../../util/env'
import { logger } from '../../util/logger'
import { GitCipherInitializerContext } from './context'


export class GitCipherInitializer {
  protected readonly context: GitCipherInitializerContext

  public constructor(context: GitCipherInitializerContext) {
    this.context = context
  }

  public async init(): Promise<void> {
    const { context } = this
    const templateConfig = resolveTemplateFilepath('plop.js')
    const plop = nodePlop(templateConfig, { force: false, destBasePath: context.workspace })
    await runPlop(plop, logger, undefined, {
      workspace: context.workspace,
      templateVersion: version,
      secretFilepath: context.secretFilepath,
      cipherRootDir: context.cipherRootDir,
      cipherIndexFilename: context.cipherIndexFilename,
      plainRepositoryUrl: context.plainRepositoryUrl,
      showAsterisk: context.showAsterisk,
      miniumPasswordLength: context.miniumPasswordLength,
    })
  }
}
