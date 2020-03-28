import path from 'path'
import { createRollupConfig } from '@barusu/rollup-config'
import manifest from './package.json'


const resolvePath = p => path.resolve(__dirname, p)
const paths = {
  eslintrc: resolvePath('.eslintrc.js'),
  tsconfig: resolvePath('tsconfig.json'),
}


const baseConfig = createRollupConfig({
  manifest,
  external: [
    '@types/fs-extra',
    'fs-extra',
    'path',
    'glob',
    'chalk',
  ],
  pluginOptions: {
    eslintOptions: {
      configFile: paths.eslintrc,
    },
    typescriptOptions: {
      tsconfig: paths.tsconfig,
      useTsconfigDeclarationDir: true,
    },
    commonjsOptions: {
      include: ['../../node_modules/**'],
      namedExports: {
      },
    },
  }
})


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
        banner: '#! /user/bin/env node',
      },
    ],
    external: [
      '@types/fs-extra',
      'fs-extra',
      'path',
      'glob',
      'chalk',
    ],
    plugins: [
      ...baseConfig[0].plugins
    ],
  }
]


export default config
