import createRollupConfig from '@guanghechen/rollup-config-cli'
import manifest from './package.json'

const config = createRollupConfig({
  manifest,
  pluginOptions: {
    typescriptOptions: {
      tsconfig: 'tsconfig.src.json',
    },
  },
  targets: [
    {
      src: 'src/cli.ts',
      target: 'lib/cjs/cli.js',
    },
  ],
})

export default config
