import path from 'path'
import { createRollupConfig } from '@barusu/rollup-config'
import manifest from './package.json'


const resolvePath = p => path.resolve(__dirname, p)
const paths = {
  tsconfig: resolvePath('tsconfig.src.json'),
  nodeModules: resolvePath('../../node_modules/**'),
}

const baseConfig = createRollupConfig({
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


const { external, plugins } = baseConfig[0]
const config = [
  ...baseConfig,
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
    external: [
      ...external,
      './index'
    ],
    plugins: [
      ...plugins
    ],
  }
]


export default config
