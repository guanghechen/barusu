import { createProgram, mountSubCommandStat } from './index'


const program = createProgram()


// mount sub-command: stat
mountSubCommandStat(program)


program
  .parse(process.argv)
