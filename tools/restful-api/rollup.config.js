import path from 'path'
import createRollupConfig from '@guanghechen/rollup-config'
import { copy } from '@barusu/rollup-plugin-copy'
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
  {
    ...baseConfig,
    plugins: [
      ...plugins,
      copy({
        copyOnce: true,
        verbose: true,
        targets: [
          {
            src: resolvePath('src/config/*'),
            dest: resolvePath('lib/config'),
          },
        ],
      }),
    ],
  },
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
      return id === './index' || id === '../index'
    },
    plugins,
  },
]

export default config
