import commandExists from 'command-exists'
import inquirer from 'inquirer'
import nodePlop from 'node-plop'
import { runPlop } from '@barusu/util-cli'
import { toLowerCase } from '@barusu/util-option'
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

    const hasGitInstalled: boolean = commandExists.sync('git')
    if (!hasGitInstalled) {
      throw new Error('Cannot find git, have you installed it?')
    }

    // If not specified by the command option, an inquiry is launched
    if (context.plainRepositoryUrl == null || /^\S*$/.test(context.plainRepositoryUrl)) {
      const { plainRepositoryUrl } = await inquirer.prompt([
        {
          type: 'input',
          name: 'plainRepositoryUrl',
          message: 'Resource git repository url?',
          filter: x => toLowerCase(x).trim(),
          transformer: (x: string) => toLowerCase(x).trim(),
        },
      ])
      ; (context as any).plainRepositoryUrl = plainRepositoryUrl
    }

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
