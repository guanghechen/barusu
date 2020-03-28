import fs from 'fs'
import path from 'path'
import webpack from 'webpack'
import { RawSourceMap } from 'source-map'
import * as loaderUtils from 'loader-utils'
import { processSourceMap } from './util/process'
export * from './util/option'
export * from './util/process'
export * from './util/resize'


// Matches only the last occurrence of sourceMappingURL
const sourceMappingURL = '\\s*[@#]\\s*sourceMappingURL\\s*=\\s*([^\\s]*)(?![\\S\\s]*sourceMappingURL)'

// Matches /* ... */ comments
const blockCommentRegex = new RegExp('/\\*' + sourceMappingURL + '\\s*\\*/')

// Matches // .... comments
const inlineCommentRegex = new RegExp('//' + sourceMappingURL + '($|\n|\r\n?)')

// Matches DataUrls
const dataUrlRegex = /data:[^;\n]+(?:;charset=[^;\n]+)?;base64,([a-zA-Z0-9+/]+={0,2})/


/**
 *
 * @param context
 * @param content
 * @param rawSourceMap
 * @see https://github.com/webpack-contrib/source-map-loader
 * @see https://github.com/ilgonmic/source-map-loader/tree/load-all-sources
 */
export default function loader(
  content: string | Buffer,
  rawSourceMap?: RawSourceMap
): string | Buffer | void | undefined {
  const context: webpack.loader.LoaderContext = this as any
  const {
    cacheable,
    resolve,
    addDependency,
    emitWarning,
  } = context
  let callback: webpack.loader.loaderCallback | undefined = context.callback

  // Make this loader result cacheable
  if (typeof cacheable === 'function') {
    cacheable()
  }

  // No changes
  const untouched = () => {
    if (typeof callback !== 'function') return
    callback(null, content, rawSourceMap)
  }

  // Operation is performed only if the content is a string type
  if (typeof content !== 'string') {
    return untouched()
  }

  const smuMatch = content.match(blockCommentRegex) || content.match(inlineCommentRegex)
  if (smuMatch == null) {
    return untouched()
  }

  callback = context.async()
  const setResult = (sourcemap: RawSourceMap) => {
    if (typeof callback !== 'function') return
    callback(null, content.replace(smuMatch[0], ''), sourcemap)
  }

  const url = smuMatch[1]
  const dataUrlMatch = dataUrlRegex.exec(url)
  if (dataUrlMatch) {
    const mapBase64 = dataUrlMatch[1]
    const mapStr = (new Buffer(mapBase64, 'base64')).toString()
    let sourcemap
    try {
      sourcemap = JSON.parse(mapStr)
    } catch (e) {
      emitWarning('Cannot parse inline SourceMap \'' + mapBase64.substr(0, 50) + '\': ' + e)
      return untouched()
    }
    processSourceMap(sourcemap, context.context, context, setResult)
  } else {
    resolve(context.context, loaderUtils.urlToRequest(url, true as any), function (err, result) {
      if (err) {
        emitWarning('Cannot find SourceMap \'' + url + '\': ' + err)
        return untouched()
      }
      addDependency(result)
      fs.readFile(result, 'utf-8', function (err, content) {
        if (err) {
          emitWarning('Cannot open SourceMap \'' + result + '\': ' + err)
          return untouched()
        }
        let sourcemap
        try {
          sourcemap = JSON.parse(content)
        } catch (e) {
          emitWarning('Cannot parse SourceMap \'' + url + '\': ' + e)
          return untouched()
        }
        processSourceMap(sourcemap, path.dirname(result), context, setResult)
      })
    })
    return
  }
}
