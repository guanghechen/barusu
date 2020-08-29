import { mountSubCommandDecrypt } from './command/decrypt'
import { mountSubCommandEncrypt } from './command/encrypt'
import { mountSubCommandInit } from './command/init'
import { createProgram } from './core/command'


const program = createProgram()


// mount sub-command: init
mountSubCommandInit(program)

// mount sub-command: encrypt
mountSubCommandEncrypt(program)

// mount sub-command: decrypt
mountSubCommandDecrypt(program)


program
  .parse(process.argv)
