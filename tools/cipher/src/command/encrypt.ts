import globby from 'globby'
import {
  Command,
  mkdirsIfNotExists,
  relativeOfWorkspace,
} from '@barusu/util-cli'
import {
  SubCommandEncryptOptions,
  createSubCommandEncrypt,
} from '../core/encrypt/command'
import { WorkspaceCatalog } from '../util/catalog'
import { EventTypes, eventBus } from '../util/event-bus'
import { logger } from '../util/logger'
import { CipherMaster } from '../util/master'
import { handleError } from './_util'


/**
 * load Sub-command: encrypt
 */
export function loadSubCommandEncrypt(
  packageName: string,
  program: Command,
): void {
  const handle = async (options: SubCommandEncryptOptions): Promise<void> => {
    try {

      // ensure paths exist
      mkdirsIfNotExists(options.workspace, true, logger)
      mkdirsIfNotExists(options.outDir, true, logger)
      mkdirsIfNotExists(options.secretFilepath, false, logger)
      mkdirsIfNotExists(options.indexFilepath, false, logger)

      // calc outRelativeDir
      const outRelativeDir = relativeOfWorkspace(options.workspace, options.outDir)
      logger.debug('outRelativeDir:', outRelativeDir)

      const master = new CipherMaster({
        workspaceDir: options.workspace,
        showAsterisk: options.showAsterisk,
        secretFilepath: options.secretFilepath,
        minimumSize: options.miniumPasswordLength,
      })

      const workspaceCatalog = (
        (await master.loadIndex(options.indexFilepath, outRelativeDir)) ||
        new WorkspaceCatalog({ items: [], cipherRelativeDir: outRelativeDir })
      )

      const resolveDestPath = (plainFilepath: string) => {
        const cipherFilepath: string = workspaceCatalog
          .resolveCipherFilepath(plainFilepath)
        return cipherFilepath
      }

      const plainFilepaths = await globby(options.plainFilepathPattern, { cwd: options.workspace })
      await master.encryptFiles(plainFilepaths, outRelativeDir, resolveDestPath, options.force)
      await master.saveIndex(options.indexFilepath, workspaceCatalog)
    } catch (error) {
      handleError(error)
    } finally {
    eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandEncrypt(packageName, handle)
  program.addCommand(command)
}
