import { name } from '@barusu/tool-cipher/package.json'
import { loadSubCommandDecrypt } from './command/decrypt'
import { loadSubCommandEncrypt } from './command/encrypt'
import { loadSubCommandInit } from './command/init'
import { createProgram } from './core/command'


const program = createProgram()

// load sub-command: init
loadSubCommandInit(name, program)

// load sub-command: encrypt
loadSubCommandEncrypt(name, program)

// load sub-command: decrypt
loadSubCommandDecrypt(name, program)


program
  .parse(process.argv)
