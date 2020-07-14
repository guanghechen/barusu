import path from 'path'
import { createRollupConfig } from '@barusu/rollup-config'
import { copy } from '@barusu/rollup-plugin-copy'
import manifest from './package.json'


const resolvePath = p => path.resolve(__dirname, p)
const paths = {
  eslintrc: resolvePath('.eslintrc.js'),
  tsconfig: resolvePath('tsconfig.src.json'),
}


const config = createRollupConfig({
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


config[0].plugins.push(
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
)


export default config
