import { Command } from '@barusu/util-cli'
import {
  SubCommandDecryptOptions,
  createSubCommandDecrypt,
} from '../core/decrypt/command'
import { GitCipherDecryptContext } from '../core/decrypt/context'
import { GitCipherDecryptProcessor } from '../core/decrypt/processor'
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
      const context: GitCipherDecryptContext = {
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

      const processor = new GitCipherDecryptProcessor(context)
      await processor.decrypt()
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandDecrypt(packageName, handle)
  program.addCommand(command)
}
