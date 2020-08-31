import { mountSubCommandGenerate } from './command/generate'
import { mountSubCommandInit } from './command/init'
import { mountSubCommandServe } from './command/serve'
import { createProgram } from './core/command'


const program = createProgram()


// mount sub-command: init
mountSubCommandInit(program)

// mount sub-command: generate
mountSubCommandGenerate(program)

// mount sub-command: serve
mountSubCommandServe(program)


program
  .parse(process.argv)
