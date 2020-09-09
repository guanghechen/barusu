import { createProgram, mountMainCommand } from './index'


const program = createProgram()


// mount sub-command: stat
mountMainCommand(program)


program
  .parse(process.argv)
