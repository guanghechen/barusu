import inquirer from 'inquirer'
import path from 'path'
import { Plop, run } from 'plop'
import { toLowerCase } from '@barusu/util-option'
import { templateRootDir } from '../../util/env'
import { logger } from '../../util/logger'
import { InitCommandContext } from './context'


export async function renderTemplates(
  context: InitCommandContext
): Promise<void> {
  const availableTemplates: string[] = ['simple']
  const { templateName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'templateName',
      default: availableTemplates[0],
      message: 'Which mock server template preferred?',
      choices: availableTemplates,
      filter: x => toLowerCase(x).trim(),
      transformer: (x: string) => toLowerCase(x).trim(),
    },
  ])

  const templateDir = path.join(templateRootDir, templateName)
  const templateConfig = path.join(templateDir, 'plop.js')
  logger.debug('templateDir:', templateDir)
  logger.debug('templateConfig:', templateConfig)

  Plop.launch({
    cwd: context.workspace,
    configPath: templateConfig,
  }, env => run(env, undefined, true))
}
