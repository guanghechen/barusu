import program from 'commander'
import { optionMaster } from 'option-master'
import Router from 'koa-router'
import manifest from '../package.json'
import { Commander } from './core/commander'
import { GenerateCommand } from './generate'
import { ServeCommand } from './serve'
import { InitCommand } from './init'

// export
export * from './core/types/api-item'
export * from './core/types/api-item-group'
export * from './core/types/api-config'
export * from './core/types/commander'
export * from './core/types/context'
export * from './core/types/option'
export * from './core/util/context-util'
export * from './core/util/fs-util'
export * from './core/util/logger'
export * from './core/util/type-util'
export * from './core/api-parser'
export * from './core/commander'
export * from './generate'
export * from './serve'
export * from './init'
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
    manifest.version,
    program,
    optionMaster,
  )

  if (subCommands.generate == null) subCommands.generate = new GenerateCommand()
  if (subCommands.serve == null) subCommands.serve = new ServeCommand()
  if (subCommands.init == null) subCommands.init = new InitCommand()

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
