import commandExists from 'command-exists'
import inquirer from 'inquirer'
import nodePlop from 'node-plop'
import { runPlop, relativeOfWorkspace } from '@barusu/util-cli'
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
    if (context.plaintextRepositoryUrl == null || /^\S*$/.test(context.plaintextRepositoryUrl)) {
      const { plaintextRepositoryUrl } = await inquirer.prompt([
        {
          type: 'input',
          name: 'plaintextRepositoryUrl',
          message: 'Resource git repository url?',
          filter: x => toLowerCase(x).trim(),
          transformer: (x: string) => toLowerCase(x).trim(),
        },
      ])
      ; (context as any).plaintextRepositoryUrl = plaintextRepositoryUrl
    }

    const templateConfig = resolveTemplateFilepath('plop.js')
    const plop = nodePlop(templateConfig, { force: false, destBasePath: context.workspace })
    await runPlop(plop, logger, undefined, {
      workspace: context.workspace,
      templateVersion: version,
      secretFilepath: relativeOfWorkspace(context.workspace, context.secretFilepath),
      indexFilepath: relativeOfWorkspace(context.workspace, context.indexFilepath),
      ciphertextRootDir: relativeOfWorkspace(context.workspace, context.ciphertextRootDir),
      plaintextRootDir: relativeOfWorkspace(context.workspace, context.plaintextRootDir),
      plaintextRepositoryUrl: context.plaintextRepositoryUrl,
      showAsterisk: context.showAsterisk,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }
}
