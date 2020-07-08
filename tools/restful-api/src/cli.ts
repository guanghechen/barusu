import program from 'commander'
import { name, version } from '@barusu/tool-restful-api/package.json'
import { loadSubCommandGenerate } from './command/generate'
import { loadSubCommandInit } from './command/init'
import { loadSubCommandServe } from './command/serve'
import { COMMAND_NAME, logger } from './index'


program
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .version(version)
  .name(COMMAND_NAME)

logger.registerToCommander(program)


program
  .option('-c, --config-path <config filepath>', '', (val, acc: string[]) => acc.concat(val), [])
  .option('--parastic-config-path <parastic config filepath>', '')
  .option('--parastic-config-entry <parastic config filepath>', '')


// load sub-command: init
loadSubCommandInit(name, program)

// load sub-command: generate
loadSubCommandGenerate(name, program)

// load sub-command: serve
loadSubCommandServe(name, program)


program
  .parse(process.argv)
