import fs from 'fs'
import minimist from 'minimist'
import path from 'path'
import { TsconfigPathAliasResolver } from './index'


const args = minimist(process.argv.slice(2))
const tsconfigPath = args.p || 'tsconfig.json'
const dtsRootPath = args.dts

const cwd = path.resolve(fs.realpathSync(process.cwd()))
const pathResolver = new TsconfigPathAliasResolver(cwd, tsconfigPath)
pathResolver.processDts(dtsRootPath)
