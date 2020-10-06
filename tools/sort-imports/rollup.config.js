import path from 'path'
import { createRollupConfig } from '@barusu/rollup-config'
import manifest from './package.json'


const resolvePath = p => path.resolve(__dirname, p)
const paths = {
  tsconfig: resolvePath('tsconfig.src.json'),
}

const baseConfig = createRollupConfig({
  manifest,
  pluginOptions: {
    typescriptOptions: {
      tsconfig: paths.tsconfig,
    },
  }
})


const { external, plugins } = baseConfig
const config = [
  baseConfig,
  {
    input: resolvePath('src/cli.ts'),
    output: [
      {
        file: resolvePath('lib/cjs/cli.js'),
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
        banner: '#! /usr/bin/env node',
      },
    ],
    external: (id) => {
      if (external(id)) return true
      return id === './index'
    },
    plugins,
  }
]


export default config
