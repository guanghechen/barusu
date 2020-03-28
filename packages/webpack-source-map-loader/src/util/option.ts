import webpack from 'webpack'
import * as loaderUtils from 'loader-utils'


/**
 * options for @barusu/webpack-source-map-loader
 */
export interface SourceMapLoaderOptions {

}


/**
 * get options
 * @param loaderContext
 */
export function getLoaderOptions(
  loaderContext: webpack.loader.LoaderContext
): SourceMapLoaderOptions {
  const loaderOptions: Partial<SourceMapLoaderOptions> = {
    ...loaderUtils.getOptions(loaderContext)
  }

  return loaderOptions as SourceMapLoaderOptions
}
