import execa from 'execa'
import path from 'path'
import {
  createInitialCommit,
  installDependencies,
  isNonExistentOrEmpty,
} from '@barusu/util-cli'
import { logger } from '../../util/logger'
import { RestfulApiInitContext } from './context'
import { renderTemplates } from './util'


export class RestfulApiInitProcessor {
  protected readonly context: RestfulApiInitContext

  public constructor(context: RestfulApiInitContext) {
    this.context = context
  }

  /**
   * Initialize a mock server project with templates
   */
  async init(): Promise<void> {
    const { context } = this

    // ensure target path is empty
    if (!isNonExistentOrEmpty(context.workspace)) {
      const relativeProjectPath = path.relative(context.cwd, context.workspace)
      logger.error(`${ relativeProjectPath } is not a non-empty directory path`)
      return
    }

    await renderTemplates(context)

    const execaOptions: execa.Options = { stdio: 'inherit', cwd: context.workspace }

    // install dependencies
    await installDependencies(execaOptions)

    // create init commit
    await createInitialCommit(execaOptions)
  }
}
