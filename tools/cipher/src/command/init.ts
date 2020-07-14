import fs from 'fs-extra'
import { Command, mkdirsIfNotExists } from '@barusu/util-cli'
import {
  SubCommandInitOptions,
  createSubCommandInit,
} from '../core/init/command'
import { EventTypes, eventBus } from '../util/event-bus'
import { logger } from '../util/logger'
import { CipherMaster } from '../util/master'
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
      // ensure paths exist
      mkdirsIfNotExists(options.workspace, true, logger)
      mkdirsIfNotExists(options.secretFilepath, false, logger)

      // Secret file is existed
      if (fs.existsSync(options.secretFilepath)) {
        logger.error('secret file already exists.')
        process.exit(0)
      }

      const master = new CipherMaster({
        workspaceDir: options.workspace,
        showAsterisk: options.showAsterisk,
        secretFilepath: options.secretFilepath,
        minimumSize: options.miniumPasswordLength,
      })
      await master.createSecret()
    } catch (error) {
      handleError(error)
    } finally {
      eventBus.dispatch({ type: EventTypes.EXITING })
    }
  }

  const command = createSubCommandInit(packageName, handle)
  program.addCommand(command)
}
