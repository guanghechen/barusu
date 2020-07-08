import execa from 'execa'
import path from 'path'
import { isNonExistentOrEmpty } from '@barusu/util-cli'
import { logger } from '../../util/logger'
import { InitCommandContext } from './context'
import { createInitialCommit } from './initial-git-commit'
import { installDependencies } from './install-dependencies'


/**
 * Initialize a mock server project with templates
 * @param context
 */
export async function init(context: InitCommandContext): Promise<void> {
  // ensure target path is empty
  if (!isNonExistentOrEmpty(context.workspace)) {
    const relativeProjectPath = path.relative(context.cwd, context.workspace)
    logger.error(`${ relativeProjectPath } is not a non-empty directory path`)
    return
  }

  const execaOptions: execa.Options = { stdio: 'inherit', cwd: context.workspace }

  // install dependencies
  await installDependencies(execaOptions)

  // create init commit
  await createInitialCommit(execaOptions)
}
