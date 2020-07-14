import globby from 'globby'
import path from 'path'
import {
  Command,
  mkdirsIfNotExists,
  relativeOfWorkspace,
} from '@barusu/util-cli'
import {
  SubCommandDecryptOptions,
  createSubCommandDecrypt,
} from '../core/decrypt/command'
import { EventTypes, eventBus } from '../util/event-bus'
import { logger } from '../util/logger'
import { CipherMaster } from '../util/master'
import { handleError } from './_util'


/**
 * load Sub-command: decrypt
 */
export function loadSubCommandDecrypt(
  packageName: string,
  program: Command,
): void {
  const handle = async (options: SubCommandDecryptOptions): Promise<void> => {
    try {
      // ensure paths exist
      mkdirsIfNotExists(options.workspace, true, logger)
      mkdirsIfNotExists(options.cipherRootDir, true, logger)
      mkdirsIfNotExists(options.outDir, true, logger)
      mkdirsIfNotExists(options.secretFilepath, false, logger)
      mkdirsIfNotExists(options.indexFilepath, false, logger)

      // calc cipherRelativeDir
      const cipherRelativeDir = relativeOfWorkspace(options.workspace, options.cipherRootDir)
      logger.debug('cipherRelativeDir:', cipherRelativeDir)

      // calc outRelativeDir
      const outRelativeDir = relativeOfWorkspace(options.workspace, options.outDir)
      logger.debug('outRelativeDir:', outRelativeDir)

      const master = new CipherMaster({
        workspaceDir: options.workspace,
        showAsterisk: options.showAsterisk,
        secretFilepath: options.secretFilepath,
        minimumSize: options.miniumPasswordLength,
      })

      // parse workspace
      const workspaceCatalog = await master.loadIndex(
        options.indexFilepath, cipherRelativeDir)
      if (workspaceCatalog == null) {
        throw new Error('[fix me] workspaceCatalog is null')
      }

      const resolveDestPath = (cipherFilepath: string) => {
        const plainFilepath: string | null = workspaceCatalog
          .resolvePlainFilepath(path.relative(cipherRelativeDir, cipherFilepath))
        if (plainFilepath == null) {
          throw new Error(`[fix me] plainFilepath is null: cipherFilepath(${ cipherFilepath })`)
        }
        return plainFilepath
      }

      // If cipherFilepathPatterns is null, decrypt all files registered in workspace catalog,
      // Otherwise, only decrypt files matched cipherFilepathPatterns.
      const cipherFilepaths = options.cipherFilepathPattern.length > 0
        ? await globby(options.cipherFilepathPattern, { cwd: options.workspace })
        : workspaceCatalog.toData().items.map(x => path.join(cipherRelativeDir, x.cipherFilepath))
      await master.decryptFiles(cipherFilepaths, outRelativeDir, resolveDestPath, options.force)
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandDecrypt(packageName, handle)
  program.addCommand(command)
}
