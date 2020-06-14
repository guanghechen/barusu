import path from 'path'
import { createRollupConfig } from '@barusu/rollup-config'
import manifest from './package.json'


const resolvePath = p => path.resolve(__dirname, p)
const paths = {
  eslintrc: resolvePath('.eslintrc.js'),
  tsconfig: resolvePath('tsconfig.src.json'),
}


const baseConfig = createRollupConfig({
  manifest,
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
