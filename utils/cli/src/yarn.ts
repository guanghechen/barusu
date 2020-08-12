import commandExists from 'command-exists'
import execa from 'execa'
import inquirer from 'inquirer'
import { toLowerCase } from '@barusu/util-option'


/**
 * Run `npm/yarn install` to Install node.js dependencies
 * @param execaOptions
 */
export async function installDependencies(execaOptions: execa.Options): Promise<void> {
  const hasYarnInstalled: boolean = commandExists.sync('yarn')

  /**
   * If neither yarn nor npm is installed, this operation will be skipped
   */
  if (!hasYarnInstalled) {
    const hasNpmInstalled: boolean = commandExists.sync('npm')
    if (!hasNpmInstalled) return
  }

  const { npmScript } = await inquirer.prompt([
    {
      type: 'list',
      name: 'npmScript',
      default: hasYarnInstalled ? 'yarn' : 'npm',
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
