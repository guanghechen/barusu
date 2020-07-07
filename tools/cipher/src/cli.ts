import program from 'commander'
import { name, version } from '@barusu/tool-cipher/package.json'
import { loadSubCommandDecrypt } from './command/decrypt'
import { loadSubCommandEncrypt } from './command/encrypt'
import { loadSubCommandInit } from './command/init'
import { COMMAND_NAME, logger } from './index'


program
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .version(version)
  .name(COMMAND_NAME)

logger.registerToCommander(program)


// load sub-command: init
loadSubCommandInit(name, program)

// load sub-command: encrypt
loadSubCommandEncrypt(name, program)

// load sub-command: decrypt
loadSubCommandDecrypt(name, program)


program
  .parse(process.argv)
