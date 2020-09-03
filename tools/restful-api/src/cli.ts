import {
  createProgram,
  mountSubCommandGenerate,
  mountSubCommandInit,
  mountSubCommandServe,
} from './index'


const program = createProgram()


// mount sub-command: init
mountSubCommandInit(program)

// mount sub-command: generate
mountSubCommandGenerate(program)

// mount sub-command: serve
mountSubCommandServe(program)


program
  .parse(process.argv)
