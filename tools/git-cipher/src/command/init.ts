import { Command } from '@barusu/util-cli'
import {
  SubCommandInitOptions,
  createSubCommandInit,
} from '../core/init/command'
import { GitCipherInitializerContext } from '../core/init/context'
import { GitCipherInitializer } from '../core/init/initializer'
import { EventTypes, eventBus } from '../util/events'
import { handleError } from './_util'
import { SecretMaster } from '../util/secret'
import { AESCipher } from '../util/cipher'


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
        secretFilepath: options.secretFilepath,
        indexFilepath: options.indexFilepath,
        ciphertextRootDir: options.ciphertextRootDir,
        plaintextRootDir: options.plaintextRootDir,
        plaintextRepositoryUrl: options.plaintextRepositoryUrl,
        showAsterisk: options.showAsterisk,
        minPasswordLength: options.minPasswordLength,
        maxPasswordLength: options.maxPasswordLength,
      }

      const initializer = new GitCipherInitializer(context)
      await initializer.init()

      const oldSecretMaster = new SecretMaster({
        cipherFactory: { create: () => new AESCipher() },
        showAsterisk: context.showAsterisk,
        minPasswordLength: context.minPasswordLength,
        maxPasswordLength: context.maxPasswordLength,
      })
      const secretMaster = await oldSecretMaster.recreate()
      oldSecretMaster.cleanup()
      await secretMaster.save(context.secretFilepath, 'utf-8')
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandInit(packageName, handle)
  program.addCommand(command)
}
