import path from 'path'
import { createRollupConfig } from '@barusu/rollup-config'
import { copy } from '@barusu/rollup-plugin-copy'
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
  {
    ...baseConfig[0],
    plugins: [
      ...plugins,
      copy({
        copyOnce: true,
        verbose: true,
        targets: [
          {
            src: resolvePath('src/config/*'),
            dest: resolvePath('lib/config'),
          }
        ]
      })
    ]
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
