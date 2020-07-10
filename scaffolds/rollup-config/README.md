[![npm version](https://img.shields.io/npm/v/@barusu/rollup-config.svg)](https://www.npmjs.com/package/@barusu/rollup-config)
[![npm download](https://img.shields.io/npm/dm/@barusu/rollup-config.svg)](https://www.npmjs.com/package/@barusu/rollup-config)
[![npm license](https://img.shields.io/npm/l/@barusu/rollup-config.svg)](https://www.npmjs.com/package/@barusu/rollup-config)


# Usage

* Install
  ```shell
  yarn add --dev @barusu/rollup-config
  ```

* Use in `rollup.config.js`
  ```js
  import path from 'path'
  import { createRollupConfig } from '@barusu/rollup-config'
  import manifest from './package.json'

  const resolvePath = p => path.resolve(__dirname, p)
  const paths = {
    eslintrc: resolvePath('.eslintrc.js'),
    tsconfig: resolvePath('tsconfig.json'),
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
        include: ['./node_modules/**'],
      },
    }
  })

  export default config
  ```

## Options

extends from rollup.InputOptions

* `manifest`

   property       | type                      | required  | description
  :--------------:|:-------------------------:|:---------:|:------------------------
   `source`       | `string`                  | `true`    | source entry file
   `main`         | `string`                  | `false`   | target entry file of cjs
   `module`       | `string`                  | `false`   | target entry file of es
   `dependencies` | `{[key: string]: string}` | `false`   | ignore these dependencies (`external`)


* `pluginOptions`
   property                   | type      | required  | description
  :--------------------------:|:---------:|:---------:|:------------------------
   `eslintOption`             | `object`  | `false`   | options for [rollup-plugin-eslint][]
   `nodeResolveOptions`       | `object`  | `false`   | options for [@rollup/plugin-node-resolve][]
   `typescriptOptions`        | `object`  | `false`   | options for [rollup-plugin-typescript2][]
   `commonjsOptions`          | `object`  | `false`   | options for [@rollup/plugin-commonjs][]
   `peerDepsExternalOptions`  | `object`  | `false`   | options for [rollup-plugin-peer-deps-external][]


[rollup-plugin-eslint]: https://github.com/TrySound/rollup-plugin-eslint#readme
[@rollup/plugin-node-resolve]: https://github.com/rollup/plugins/tree/master/packages/node-resolve#readme
[rollup-plugin-typescript2]: https://github.com/ezolenko/rollup-plugin-typescript2#readme
[@rollup/plugin-commonjs]: https://github.com/rollup/plugins/tree/master/packages/commonjs#readme
[rollup-plugin-peer-deps-external]: https://github.com/pmowrer/rollup-plugin-peer-deps-external#readme
