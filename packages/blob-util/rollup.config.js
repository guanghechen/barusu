import path from 'path'
import { createRollupConfig } from '@barusu/rollup-config'
import manifest from './package.json'


const resolvePath = p => path.resolve(__dirname, p)
const paths = {
  eslintrc: resolvePath('.eslintrc'),
  tsconfig: resolvePath('tsconfig.json'),
}


const config = createRollupConfig({
  manifest,
  pluginOptions: {
    eslintOptions: {
      configFile: paths.eslintrc,
      include: ['src/**/*{.ts,.tsx}'],
      exclude: ['src/**/*.styl.d.ts'],
    },
    typescriptOptions: {
      tsconfig: paths.tsconfig,
      include: ['src/**/*{.ts,.tsx}'],
      exclude: '**/__tests__/**',
    },
    commonjsOptions: {
      include: ['../../node_modules/**'],
      exclude: ['**/*.stories.js'],
      namedExports: {
      },
    },
  }
})


export default config
