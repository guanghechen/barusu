import { Command } from '@barusu/util-cli'
import {
  SubCommandDecryptOptions,
  createSubCommandDecrypt,
} from '../core/decrypt/command'
import { GitCipherDecryptorContext } from '../core/decrypt/context'
import { GitCipherDecryptor } from '../core/decrypt/decryptor'
import { EventTypes, eventBus } from '../util/events'
import { handleError } from './_util'


/**
 * load Sub-command: decrypt
 */
export function loadSubCommandDecrypt(
  packageName: string,
  program: Command,
): void | never {
  const handle = async (options: SubCommandDecryptOptions): Promise<void> => {
    try {
      const context: GitCipherDecryptorContext = {
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
        outDir: options.outDir,
      }

      const decryptor = new GitCipherDecryptor(context)
      await decryptor.decrypt()
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandDecrypt(packageName, handle)
  program.addCommand(command)
}
