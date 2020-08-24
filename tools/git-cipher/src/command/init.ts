import { Command } from '@barusu/util-cli'
import {
  SubCommandInitOptions,
  createSubCommandInit,
} from '../core/init/command'
import { GitCipherInitContext } from '../core/init/context'
import { GitCipherInitProcessor } from '../core/init/processor'
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
      const context: GitCipherInitContext = {
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
      const processor = new GitCipherInitProcessor(context)
      await processor.init()
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandInit(packageName, handle)
  program.addCommand(command)
}
