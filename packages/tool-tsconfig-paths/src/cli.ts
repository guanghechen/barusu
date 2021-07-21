import { createProgram, mountMainCommand } from '.'

const program = createProgram()

// mount sub-command: stat
mountMainCommand(program)

program.parse(process.argv)
