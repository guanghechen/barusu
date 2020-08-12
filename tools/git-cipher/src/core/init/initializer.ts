import commandExists from 'command-exists'
import execa from 'execa'
import inquirer from 'inquirer'
import nodePlop from 'node-plop'
import {
  absoluteOfWorkspace,
  createInitialCommit,
  ensureCriticalFilepathExists,
  installDependencies,
  mkdirsIfNotExists,
  relativeOfWorkspace,
  runPlop,
} from '@barusu/util-cli'
import { isNotEmptyString, toLowerCase } from '@barusu/util-option'
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
    const { context } = this
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

    // install dependencies
    await installDependencies({
      stdio: 'inherit',
      cwd: context.workspace,
    })

    // create initial commit
    await createInitialCommit({
      stdio: 'inherit',
      cwd: context.workspace,
    })
  }

  /**
   * Render templates
   */
  protected async renderTemplates(): Promise<void> {
    const { context } = this

    // request repository url
    let { plaintextRepositoryUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'plaintextRepositoryUrl',
        message: 'Resource git repository url?',
        filter: x => toLowerCase(x).trim(),
        transformer: (x: string) => toLowerCase(x).trim(),
      },
    ])

    // resolve plaintextRepositoryUrl
    if (isNotEmptyString(plaintextRepositoryUrl)) {
      if (/^[.]/.test(plaintextRepositoryUrl)) {
        plaintextRepositoryUrl = absoluteOfWorkspace(context.workspace, plaintextRepositoryUrl)
      }
    }
    logger.debug('plaintextRepositoryUrl:', plaintextRepositoryUrl)

    // clone plaintext repository
    if (isNotEmptyString(plaintextRepositoryUrl)) {
      await this.cloneFromRemote(plaintextRepositoryUrl)
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
      plaintextRepositoryUrl,
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

  /**
   * Clone from remote plaintext repository
   * @param plaintextRepositoryUrl  url of remote source repository
   */
  protected async cloneFromRemote(plaintextRepositoryUrl: string): Promise<void> {
    const { context } = this

    mkdirsIfNotExists(context.plaintextRootDir, true, logger)
    await execa('git', ['clone', plaintextRepositoryUrl, context.plaintextRootDir], {
      stdio: 'inherit',
      cwd: context.plaintextRootDir,
    })
  }
}
