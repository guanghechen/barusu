import commandExists from 'command-exists'
import inquirer from 'inquirer'
import nodePlop from 'node-plop'
import { relativeOfWorkspace, runPlop } from '@barusu/util-cli'
import { toLowerCase } from '@barusu/util-option'
import { WorkspaceCatalog } from '../../util/catalog'
import { AESCipher, Cipher } from '../../util/cipher'
import { resolveTemplateFilepath, version } from '../../util/env'
import { logger } from '../../util/logger'
import { SecretMaster } from '../../util/secret'
import { GitCipherInitializerContext } from './context'


export class GitCipherInitializer {
  protected readonly context: GitCipherInitializerContext
  protected secretMaster: SecretMaster

  public constructor(context: GitCipherInitializerContext) {
    this.context = context
    this.secretMaster = new SecretMaster({
      cipherFactory: { create: () => new AESCipher() },
      secretFileEncoding: context.secretFileEncoding,
      secretContentEncoding: 'hex',
      showAsterisk: context.showAsterisk,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  public async init(): Promise<void> {
    const hasGitInstalled: boolean = commandExists.sync('git')
    if (!hasGitInstalled) {
      throw new Error('Cannot find git, have you installed it?')
    }

    // render templates
    await this.renderTemplates()

    // create secret  file
    await this.createSecretFile()

    // create index file
    await this.createIndexFile()
  }

  /**
   * Render templates
   */
  protected async renderTemplates(): Promise<void> {
    const { context } = this
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
      encoding: context.encoding,
      secretFilepath: relativeOfWorkspace(context.workspace, context.secretFilepath),
      secretFileEncoding: context.secretFileEncoding,
      indexFilepath: relativeOfWorkspace(context.workspace, context.indexFilepath),
      indexFileEncoding: context.indexFileEncoding,
      ciphertextRootDir: relativeOfWorkspace(context.workspace, context.ciphertextRootDir),
      plaintextRootDir: relativeOfWorkspace(context.workspace, context.plaintextRootDir),
      plaintextRepositoryUrl: context.plaintextRepositoryUrl,
      showAsterisk: context.showAsterisk,
      minPasswordLength: context.minPasswordLength,
      maxPasswordLength: context.maxPasswordLength,
    })
  }

  /**
   * Create secret file
   */
  protected async createSecretFile(): Promise<void> {
    const { context } = this
    const oldSecretMaster = this.secretMaster
    this.secretMaster = await oldSecretMaster.recreate()
    oldSecretMaster.cleanup()
    await this.secretMaster.save(context.secretFilepath)
  }

  /**
   * Create index file
   */
  protected async createIndexFile(): Promise<void> {
    const { context, secretMaster } = this
    const cipher: Cipher = secretMaster.getCipher()
    const catalog = new WorkspaceCatalog({
      cipher,
      indexFileEncoding: context.indexFileEncoding,
      indexContentEncoding: 'base64',
      plaintextRootDir: context.plaintextRootDir,
      ciphertextRootDir: context.ciphertextRootDir,
    })
    await catalog.save(context.indexFilepath)
  }
}
