import fs from 'fs'
import path from 'path'
import { version } from '@barusu/tool-tsconfig-paths/package.json'
import program from 'commander'
import { TsconfigPathAliasResolver } from './index'
import { logger } from './util'


program
  .version(version)

logger.registerToCommander(program)


program
  .name('resolve-tsconfig-paths')
  .usage('[options]')
  .option('-p, --project <tsconfigPath>', 'path of tsconfig.json', 'tsconfig.json')
  .option('-dts, <dtsRootPath>', 'root path of declarations')
  .action(function (cmd, options: any) {
    const cwd = path.resolve(fs.realpathSync(process.cwd()))
    const tsconfigPath = options.p || 'tsconfig.json'
    const dtsRootPath = options.dts
    logger.debug('cwd:', cwd)
    logger.debug('tsconfigPath:', tsconfigPath)
    logger.debug('dtsRootPath:', dtsRootPath)

    const pathResolver = new TsconfigPathAliasResolver(cwd, tsconfigPath)
    pathResolver.processDts(dtsRootPath)
  })
  .parse(process.argv)
