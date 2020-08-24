import { loadSubCommandStat } from './command/stat'
import { createProgram } from './core/command'
import { name } from './util/env'


const program = createProgram()


// load sub-command: stat
loadSubCommandStat(name, program)


program
  .parse(process.argv)
