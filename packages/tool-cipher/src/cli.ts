import program from 'commander'
import { name, version } from '@barusu/tool-cipher/package.json'
import { loadSubCommandInit } from './command/init'
import { logger } from './index'


program
  .version(version)
  .name('barusu-cipher')

logger.registerToCommander(program)


// load sub-command: init
loadSubCommandInit(name, program)


program
  .parse(process.argv)
