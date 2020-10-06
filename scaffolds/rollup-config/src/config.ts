import rollup from 'rollup'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import {
  CommonJSOptions,
  JsonOptions,
  NodeResolveOptions,
  PeerDepsExternalOptions,
  TypescriptOptions,
} from './types/options'
import { convertToBoolean, coverBoolean } from './util/option-util'
import { collectAllDependencies } from './util/package-util'


export interface ProdConfigParams extends rollup.InputOptions {
  /**
   * 是否生成 sourceMap （包括 declarationMap）
   * @default true
   */
  useSourceMap: boolean
  /**
   * 是否将所有的依赖置为 external
   * @default true
   */
  externalAllDependencies: boolean
  manifest: {
    /**
     * 源文件入口
     * source entry file
     */
    source: string
    /**
     * cjs 目标文件入口
     * target entry file of cjs
     */
    main?: string
    /**
     * es 目标文件入口
     * target entry file of es
     */
    module?: string
    /**
     * 依赖列表
     */
    dependencies?: { [key: string]: string }
  }
  /**
   * 插件选项
   */
  pluginOptions?: {
    /**
     * options for @rollup/plugin-json
     */
    jsonOptions?: JsonOptions,
    /**
     * options for @rollup/plugin-node-resolve
     */
    nodeResolveOptions?: NodeResolveOptions
    /**
     * options for rollup-plugin-typescript2
     */
    typescriptOptions?: TypescriptOptions
    /**
     * options for @rollup/plugin-commonjs
     */
    commonjsOptions?: CommonJSOptions
    /**
     * options for rollup-plugin-peer-deps-external
     */
    peerDepsExternalOptions?: PeerDepsExternalOptions
  }
}


const builtinExternals: string[] = [
  'glob',
  'sync',
  ...require('builtin-modules'),
]


export const createRollupConfig = (props: ProdConfigParams): rollup.RollupOptions => {
  const DEFAULT_USE_SOURCE_MAP = coverBoolean(
    true, convertToBoolean(process.env.ROLLUP_USE_SOURCE_MAP))
  const DEFAULT_EXTERNAL_ALL_DEPENDENCIES = coverBoolean(
    true, convertToBoolean(process.env.ROLLUP_EXTERNAL_ALL_DEPENDENCIES))

  // process task
  const {
    useSourceMap = DEFAULT_USE_SOURCE_MAP,
    externalAllDependencies = DEFAULT_EXTERNAL_ALL_DEPENDENCIES,
    manifest,
    pluginOptions = {},
    ...resetInputOptions
  } = props
  const {
    jsonOptions = {},
    nodeResolveOptions = {},
    typescriptOptions = {},
    commonjsOptions = {},
    peerDepsExternalOptions = {},
  } = pluginOptions

  const externalSet: Set<string> = new Set([
    ...builtinExternals,
    ...Object.keys(manifest.dependencies || {}),
  ])

  if (externalAllDependencies) {
    const dependencies = collectAllDependencies(
      undefined,
      Object.keys(manifest.dependencies || {}),
      undefined,
      /[\s\S]*/,
    )
    for (const dependency of dependencies) {
      externalSet.add(dependency)
    }
  }

  const config: rollup.RollupOptions = {
    input: manifest.source,
    output: [
      manifest.main && {
        file: manifest.main,
        format: 'cjs',
        exports: 'named',
        sourcemap: useSourceMap,
      },
      manifest.module && {
        file: manifest.module,
        format: 'es',
        exports: 'named',
        sourcemap: useSourceMap,
      }
    ].filter(Boolean) as rollup.OutputOptions[],
    external: function (id: string): boolean {
      const m = /^([^/\\]+)/.exec(id)
      if (m == null) return false
      return externalSet.has(m[1])
    },
    plugins: [
      peerDepsExternal(peerDepsExternalOptions),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
        ...nodeResolveOptions,
      }),
      json({
        indent: '  ',
        namedExports: true,
        ...jsonOptions,
      }),
      typescript({
        clean: true,
        typescript: require('typescript'),
        useTsconfigDeclarationDir: true,
        include: ['src/**/*{.ts,.tsx}'],
        tsconfigDefaults: {
          compilerOptions: {
            declaration: true,
            declarationMap: true,
            declarationDir: 'lib/types',
            outDir: 'lib',
          }
        },
        tsconfigOverride: {
          compilerOptions: {
            declarationMap: useSourceMap,
          }
        },
        ...typescriptOptions,
      }),
      commonjs({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        ...commonjsOptions,
      }),
    ] as rollup.Plugin[],
    ...resetInputOptions,
  }

  return config
}
