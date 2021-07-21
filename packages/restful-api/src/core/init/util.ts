import { toLowerCase } from '@guanghechen/option-helper'
import { runPlop } from '@guanghechen/plop-helper'
import inquirer from 'inquirer'
import nodePlop from 'node-plop'
import path from 'path'
import { templateRootDir } from '../../env/constant'
import { logger } from '../../env/logger'
import type { RestfulApiInitContext } from './context'

/**
 * Render handlebar boilerplates
 * @param context
 * @param plopBypass
 */
export async function renderTemplates(
  context: RestfulApiInitContext,
  plopBypass: string[],
): Promise<void> {
  const availableTemplates: string[] = ['simple']

  let templateName: string
  if (plopBypass.length > 0) {
    templateName = plopBypass.shift()!
  } else {
    templateName = (
      await inquirer.prompt([
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
    ).templateName
  }

  const templateDir = path.join(templateRootDir, templateName)
  const templateConfig = path.join(templateDir, 'plop.js')
  logger.debug('templateName:', templateName)
  logger.debug('templateDir:', templateDir)
  logger.debug('templateConfig:', templateConfig)

  const plop = nodePlop(templateConfig, {
    force: false,
    destBasePath: context.workspace,
  })

  // get prompts length to calculate the number of bypass parameters consumed
  let bypassForPlopConfigCount = 0
  const generators = plop.getGeneratorList()
  if (generators.length === 1) {
    const generator = plop.getGenerator(generators[0].name)
    bypassForPlopConfigCount = generator.prompts.length
  } else {
    const generateName = plopBypass[0]
    const generator = plop.getGenerator(generateName)
    bypassForPlopConfigCount = generator.prompts.length + 1
  }

  const bypassForPlopConfig = plopBypass.splice(0, bypassForPlopConfigCount)
  logger.debug('bypassForPlopConfig:', bypassForPlopConfig)

  const error = await runPlop(plop, bypassForPlopConfig, {
    workspace: context.workspace,
  })
  if (error != null) logger.error(error)
}
