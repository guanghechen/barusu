import { mountSubCommandStat } from './command/stat'
import { createProgram } from './core/command'


const program = createProgram()


// mount sub-command: stat
mountSubCommandStat(program)


program
  .parse(process.argv)
