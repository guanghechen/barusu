import { Command } from '@barusu/util-cli'
import {
  SubCommandInitOptions,
  createSubCommandInit,
} from '../core/init/command'
import { GitCipherInitializerContext } from '../core/init/context'
import { GitCipherInitializer } from '../core/init/initializer'
import { EventTypes, eventBus } from '../util/events'
import { handleError } from './_util'


/**
 * load Sub-command: init
 */
export function loadSubCommandInit(
  packageName: string,
  program: Command,
): void | never {
  const handle = async (options: SubCommandInitOptions): Promise<void> => {
    try {
      const context: GitCipherInitializerContext = {
        cwd: options.cwd,
        workspace: options.workspace,
        encoding: options.encoding,
        secretFilepath: options.secretFilepath,
        secretFileEncoding: options.secretFileEncoding,
        indexFilepath: options.indexFilepath,
        indexFileEncoding: options.indexFileEncoding,
        ciphertextRootDir: options.ciphertextRootDir,
        plaintextRootDir: options.plaintextRootDir,
        showAsterisk: options.showAsterisk,
        minPasswordLength: options.minPasswordLength,
        maxPasswordLength: options.maxPasswordLength,
      }

      // create
      const initializer = new GitCipherInitializer(context)
      await initializer.init()
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandInit(packageName, handle)
  program.addCommand(command)
}
