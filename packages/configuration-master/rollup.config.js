import path from 'path'
import { createRollupConfig } from '@barusu/rollup-config'
import manifest from './package.json'


const resolvePath = p => path.resolve(__dirname, p)
const paths = {
  tsconfig: resolvePath('tsconfig.src.json'),
  nodeModules: resolvePath('../../node_modules/**'),
}

const config = createRollupConfig({
  manifest,
  pluginOptions: {
    typescriptOptions: {
      tsconfig: paths.tsconfig,
    },
    commonjsOptions: {
      include: [paths.nodeModules],
    },
  }
})


export default config
