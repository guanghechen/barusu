import {
  createInitialCommit,
  installDependencies,
  isNonExistentOrEmpty,
} from '@barusu/util-cli'
import type execa from 'execa'
import path from 'path'
import { logger } from '../../env/logger'
import type { RestfulApiInitContext } from './context'
import { renderTemplates } from './util'

export class RestfulApiInitProcessor {
  protected readonly context: RestfulApiInitContext

  constructor(context: RestfulApiInitContext) {
    this.context = context
  }

  /**
   * Initialize a mock server project with templates
   */
  public async init(): Promise<void> {
    const { context } = this

    // ensure target path is empty
    if (!isNonExistentOrEmpty(context.workspace)) {
      const relativeProjectPath = path.relative(context.cwd, context.workspace)
      logger.error(`${relativeProjectPath} is not a non-empty directory path`)
      return
    }

    const plopBypass = [...context.plopBypass]

    await renderTemplates(context, plopBypass)

    const execaOptions: execa.Options = {
      stdio: 'inherit',
      cwd: context.workspace,
    }

    // install dependencies
    await installDependencies(execaOptions, plopBypass, logger)

    // create init commit
    await createInitialCommit(execaOptions, plopBypass, logger)
  }
}
