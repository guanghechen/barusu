import { name, version } from '@barusu/tool-restful-api/package.json'
import { createTopCommand } from '@barusu/util-cli'
import { loadSubCommandGenerate } from './command/generate'
import { loadSubCommandInit } from './command/init'
import { loadSubCommandServe } from './command/serve'
import { COMMAND_NAME, logger } from './index'


const program = createTopCommand(
  COMMAND_NAME,
  version,
  logger
)


// load sub-command: init
loadSubCommandInit(name, program)

// load sub-command: generate
loadSubCommandGenerate(name, program)

// load sub-command: serve
loadSubCommandServe(name, program)


program
  .parse(process.argv)
