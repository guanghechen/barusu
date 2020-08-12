import { Command } from '@barusu/util-cli'
import {
  SubCommandEncryptOptions,
  createSubCommandEncrypt,
} from '../core/encrypt/command'
import { GitCipherEncryptorContext } from '../core/encrypt/context'
import { GitCipherEncryptor } from '../core/encrypt/encryptor'
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
      const context: GitCipherEncryptorContext = {
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

      const encryptor = new GitCipherEncryptor(context)
      await encryptor.encrypt()
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandEncrypt(packageName, handle)
  program.addCommand(command)
}
