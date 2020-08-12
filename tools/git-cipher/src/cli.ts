import { loadSubCommandEncrypt } from './command/encrypt'
import { loadSubCommandInit } from './command/init'
import { createProgram } from './core/command'
import { name } from './util/env'


const program = createProgram()


// load sub-command: init
loadSubCommandInit(name, program)

// load sub-command: encrypt
loadSubCommandEncrypt(name, program)


program
  .parse(process.argv)
