import { Command } from '@barusu/util-cli'
import {
  SubCommandEncryptOptions,
  createSubCommandEncrypt,
} from '../core/encrypt/command'
import { GitCipherEncryptContext } from '../core/encrypt/context'
import { GitCipherEncryptProcessor } from '../core/encrypt/processor'
import { EventTypes, eventBus } from '../util/events'
import { handleError } from './_util'


/**
 * load Sub-command: encrypt
 */
export function loadSubCommandEncrypt(
  packageName: string,
  program: Command,
): void | never {
  const handle = async (options: SubCommandEncryptOptions): Promise<void> => {
    try {
      const context: GitCipherEncryptContext = {
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
        full: options.full,
        updateBeforeEncrypt: options.updateBeforeEncrypt,
      }

      const processor = new GitCipherEncryptProcessor(context)
      await processor.encrypt()
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandEncrypt(packageName, handle)
  program.addCommand(command)
}
