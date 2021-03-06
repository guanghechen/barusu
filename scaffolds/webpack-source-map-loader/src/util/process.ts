import * as fs from 'fs'
import * as loaderUtils from 'loader-utils'
import * as path from 'path'
import type { RawSourceMap } from 'source-map'
import type webpack from 'webpack'
import { resize } from './resize'

interface SourceContentItem {
  index: number
  source: string
  content: string
}

/**
 * process sourcemap
 * @param rawSourceMap
 * @param context
 * @param callback
 */
export function processSourceMap(
  rawSourceMap: RawSourceMap,
  resolveContext: string,
  context: webpack.loader.LoaderContext,
  callback: (sourcemap: RawSourceMap) => void,
): void {
  const { resolve, emitWarning, addDependency } = context

  // eslint-disable-next-line no-param-reassign
  rawSourceMap.sourcesContent = rawSourceMap.sourcesContent || []
  resize(rawSourceMap.sourcesContent, rawSourceMap.sources.length, null)

  const sourcesWithoutContent: SourceContentItem[] = []
  for (let i = 0; i < rawSourceMap.sourcesContent.length; ++i) {
    const sourceContent = rawSourceMap.sourcesContent[i]
    if (!sourceContent) {
      sourcesWithoutContent.push({
        index: i,
        source: rawSourceMap.sources[i],
        content: sourceContent,
      })
      continue
    }

    // fix sourcemap relative path
    const source = rawSourceMap.sources[i]
    if (/[/\\]/.test(source) && !path.isAbsolute(source)) {
      // eslint-disable-next-line no-param-reassign
      rawSourceMap.sources[i] = path.resolve(resolveContext, source)
    }
  }

  if (sourcesWithoutContent.length === 0) {
    callback(rawSourceMap)
    return
  }

  const sourcePrefix = rawSourceMap.sourceRoot
    ? rawSourceMap.sourceRoot + '/'
    : ''
  const tasks: Array<Promise<SourceContentItem | null>> = []
  for (const item of sourcesWithoutContent) {
    const source = sourcePrefix + item.source
    // eslint-disable-next-line no-param-reassign
    rawSourceMap.sources = rawSourceMap.sources.map(s => sourcePrefix + s)
    // eslint-disable-next-line no-param-reassign
    delete rawSourceMap.sourceRoot

    const task = new Promise<SourceContentItem | null>(onFulfilled => {
      resolve(
        resolveContext,
        loaderUtils.urlToRequest(source, true as any),
        (err, result) => {
          if (err) {
            emitWarning("Cannot find source file '" + source + "': " + err)
            return void onFulfilled(null)
          }
          addDependency(result)
          fs.readFile(result, 'utf-8', function (err, content) {
            if (err) {
              emitWarning("Cannot open source file '" + result + "': " + err)
              return void onFulfilled(null)
            }
            onFulfilled({
              index: item.index,
              source: result,
              content: content,
            })
          })
        },
      )
    })
    tasks.push(task)
  }

  Promise.all(tasks) // waiting all tasks are completed
    .then(results => {
      // get results in defined ordered
      for (const result of results) {
        if (result == null) continue
        // eslint-disable-next-line no-param-reassign
        rawSourceMap.sources[result.index] = result.source

        // eslint-disable-next-line no-param-reassign
        rawSourceMap.sourcesContent![result.index] = result.content
      }
      callback(rawSourceMap)
    })
}
