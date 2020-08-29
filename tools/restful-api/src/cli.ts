import { mountSubCommandGenerate } from './command/generate'
import { mountSubCommandInit } from './command/init'
import { mountSubCommandServe } from './command/serve'
import { createProgram } from './index'


const program = createProgram()


// load sub-command: init
mountSubCommandInit(program)

// load sub-command: generate
mountSubCommandGenerate(program)

// load sub-command: serve
mountSubCommandServe(program)


program
  .parse(process.argv)
