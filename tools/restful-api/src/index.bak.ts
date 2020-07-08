import program from 'commander'
import Router from 'koa-router'
import { optionMaster } from 'option-master'
import { version } from '@barusu/tool-restful-api/package.json'
import { Commander } from './_core/commander'
import { GenerateCommand } from './_generate'
import { InitCommand } from './_init'
import { ServeCommand } from './_serve'


// export
export * from './_core/types/api-item'
export * from './_core/types/api-item-group'
export * from './_core/types/api-config'
export * from './_core/types/commander'
export * from './_core/types/context'
export * from './_core/types/option'
export * from './_core/util/context-util'
export * from './_core/util/logger'
export * from './_core/util/type-util'
export * from './util/api-parser'
export * from './_core/commander'
export * from './_generate'
export * from './_serve'
export * from './_init'
export { Router }


/**
 * Create cli program.
 * If args is not null, use this args to execute the command
 * @param args
 */
export function execCommand(args?: string[], subCommands: {
  generate?: GenerateCommand,
  serve?: ServeCommand,
  init?: InitCommand,
} = {}): Commander {
  const commander = new Commander(
    version,
    program,
    optionMaster,
  )

  if (subCommands.generate == null) {
    // eslint-disable-next-line no-param-reassign
    subCommands.generate = new GenerateCommand()
  }
  if (subCommands.serve == null) {
    // eslint-disable-next-line no-param-reassign
    subCommands.serve = new ServeCommand()
  }
  if (subCommands.init == null) {
    // eslint-disable-next-line no-param-reassign
    subCommands.init = new InitCommand()
  }

  // register sub-command
  commander
    .registerCommand(subCommands.generate)
    .registerCommand(subCommands.serve)
    .registerCommand(subCommands.init)

  // run command
  if (args != null) {
    commander.run(args)
  }
  return commander
}
