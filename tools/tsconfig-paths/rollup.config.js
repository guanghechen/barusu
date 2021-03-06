import createRollupConfig from '@guanghechen/rollup-config'
import path from 'path'
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
  },
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
    external: id => {
      if (external(id)) return true
      return /\.\/index$/.exec(id) || /\.$/.exec(id)
    },
    plugins,
  },
]

export default config
