/* eslint-disable @typescript-eslint/no-var-requires */
import inquirer from 'inquirer'
import nodePlop from 'node-plop'
import path from 'path'
import { runPlop } from '@barusu/util-cli'
import { toLowerCase } from '@barusu/util-option'
import { templateRootDir } from '../../util/env'
import { logger } from '../../util/logger'
import { RestfulApiInitializerContext } from './context'


export async function renderTemplates(
  context: RestfulApiInitializerContext
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

  const plop = nodePlop(templateConfig, { force: false, destBasePath: context.workspace })
  await runPlop(plop, logger, undefined, { workspace: context.workspace })
}
