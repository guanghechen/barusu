import { createProgram, mountSubCommandStat } from '.'

const program = createProgram()

// mount sub-command: stat
mountSubCommandStat(program)

program.parse(process.argv)
