import program from 'commander'
import path from 'path'
import { version } from '@barusu/tool-cipher/package.json'
import { logger } from './index'


program
  .version(version)

logger.registerToCommander(program)


program
  .name('sort-imports')
  .usage('<cwd> [options]')
  .arguments('<cwd>')
  .action(function (cmd, options: any) {
    const cwd: string = options.args[0] || path.resolve()
    const packageJsonPath = path.resolve(cwd, 'package.json')
  })
  .parse(process.argv)
