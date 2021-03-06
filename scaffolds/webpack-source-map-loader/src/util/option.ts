import * as loaderUtils from 'loader-utils'
import type webpack from 'webpack'

/**
 * options for @barusu/webpack-source-map-loader
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SourceMapLoaderOptions {}

/**
 * get options
 * @param loaderContext
 */
export function getLoaderOptions(
  loaderContext: webpack.loader.LoaderContext,
): SourceMapLoaderOptions {
  const loaderOptions: Partial<SourceMapLoaderOptions> = {
    ...loaderUtils.getOptions(loaderContext),
  }

  return loaderOptions as SourceMapLoaderOptions
}
