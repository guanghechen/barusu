import commandExists from 'command-exists'
import execa from 'execa'
import inquirer from 'inquirer'


/**
 * Create initial commit
 */
export async function createInitialCommit(
  execaOptions: execa.Options,
): Promise<void> {
  /**
   * If git is not installed yet, this operation will be skipped
   */
  const hasGitInstalled: boolean = commandExists.sync('git')
  if (!hasGitInstalled) {
    return
  }

  const { doInitialCommit } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'doInitialCommit',
      default: false,
      message: 'Create initial commit?',
    },
  ])

  // skip
  if (!doInitialCommit) return

  // create init commit
  await execa('git', ['init'], execaOptions)
  await execa('git', ['add', '-A'], execaOptions)
  await execa('git', ['commit', '-m', ':tada:  initialize.'], execaOptions)
}
