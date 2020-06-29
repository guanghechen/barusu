import fs from 'fs-extra'
import path from 'path'
import execa from 'execa'
import inquirer from 'inquirer'
import { toLowerCase } from 'option-master'
import { logger } from '../core/util/logger'
import { isNonExistentOrEmpty } from '../core/util/fs-util'
import { renderTemplateFileAndOutput, TemplateData } from '../core/util/template-util'
import { calcConfigFilePath } from '../core/util/context-util'
import { RestfulApiToolInitiatorContext } from './context'


/**
 * 生成基于此工具的 Mock Server 项目的初始化目录结构和预置内容
 */
export class RestfulApiToolInitiator {
  protected readonly context: RestfulApiToolInitiatorContext

  public constructor(context: RestfulApiToolInitiatorContext) {
    this.context = context

    // debug logger
    logger.debug('[context] cwd:', context.cwd)
    logger.debug('[context] projectRootPath:', context.projectRootPath)
    logger.debug('[context] tsConfigPath:', context.tsConfigPath)
    logger.debug('[context] schemaRootPath:', context.schemaRootPath)
    logger.debug('[context] apiConfigPath:', context.apiConfigPath)
    logger.debug('[context] encoding:', context.encoding)
  }

  /**
   *
   */
  public async init() {
    const { context } = this

    // ensure target path is empty
    if (!isNonExistentOrEmpty(context.projectRootPath)) {
      const relativeProjectPath = path.relative(context.cwd, context.projectRootPath)
      logger.error(`${ relativeProjectPath } is not a non-empty directory path`)
      return -1
    }

    await this.renderTemplates()

    const execaOptions: execa.Options = { stdio: 'inherit', cwd: context.projectRootPath }

    // install dependencies
    await this.installDependencies(execaOptions)

    // create init commit
    await this.createInitialCommit(execaOptions)
  }

  /**
   * render template files
   */
  private async renderTemplates () {
    const { context } = this
    const projectName = path.basename(context.projectRootPath)
    const renderAndOutput = async (templateFile: string, data: TemplateData = {}, outputFile: string = templateFile) => {
      const templateFilePath: string = calcConfigFilePath('template', templateFile)

      // Recursive rendering if templateFile is a directory path
      const stat = fs.statSync(templateFilePath)
      if (stat.isDirectory()) {
        const files: string[] = fs.readdirSync(templateFilePath)
        for (const file of files) {
          await renderAndOutput(
            path.join(templateFile, file),
            data,
            path.join(outputFile, file),
          )
        }
        return
      }

      if (outputFile.endsWith('.plop')) {
        outputFile = outputFile.substr(0, outputFile.length - 5)
      }
      const outputFilePath: string = path.resolve(context.projectRootPath, outputFile)
      const outputDir: string = path.dirname(outputFilePath)

      // Create if the parent path of the file does not exist
      if (!fs.existsSync(outputDir)) {
        logger.verbose(`mkdir  ${ outputDir }`)
        fs.mkdirpSync(outputDir)
      }

      logger.verbose(`output ${ outputFilePath }`)
      await renderTemplateFileAndOutput(templateFilePath, context.encoding, data, outputFilePath)
      return
    }

    // template files
    const data = {
      projectName,
      toolVersion: context.globalOptions.version,
      encoding: context.globalOptions.encoding,
      logLevel: context.globalOptions.logLevel,
    }

    logger.debug('[init] data:', data)
    await renderAndOutput('simple/', data, '')
  }

  /**
   * run npm/yarn start
   */
  private async installDependencies (execaOptions: execa.Options) {
    const { npmScript } = await inquirer.prompt([
      {
        type: 'list',
        name: 'npmScript',
        default: 'yarn',
        message: 'npm or yarn?',
        choices: ['npm', 'yarn', 'skip'],
        filter: x => toLowerCase(x).trim(),
        transformer: (x: string) => toLowerCase(x).trim(),
      },
    ])

    // skip installing dependencies
    if (npmScript === 'skip') return

    // install dependencies
    await execa(npmScript, ['install'], execaOptions)
  }

  /**
   * create initial commit
   */
  private async createInitialCommit (execaOptions: execa.Options) {
    const { doInitialCommit } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'doInitialCommit',
        default: true,
        message: 'create initial commit?',
      },
    ])

    // skip
    if (!doInitialCommit) return

    // create init commit
    await execa('git', ['init'], execaOptions)
    await execa('git', ['add', '-A'], execaOptions)
    await execa('git', ['commit', '-m', ':tada: initialize.'], execaOptions)
  }
}
