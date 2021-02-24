import type {
  RollupPluginCopyOptions,
  RollupPluginCopyTargetItem,
} from './types'
import chalk from 'chalk'
import fs, { CopyOptions } from 'fs-extra'
import globby from 'globby'
import { isPlainObject } from 'is-plain-object'
import path from 'path'
import { generateCopyTarget, stringify } from './util'

/**
 *
 * @param options
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function copy(options: RollupPluginCopyOptions = {}) {
  const {
    targets = [],
    copyOnce = false,
    flatten = true,
    hook = 'buildEnd',
    watchHook = 'buildStart',
    verbose: shouldBeVerbose = false,
    ...globalGlobbyOptions
  } = options

  const log = {
    /**
     * print verbose messages
     * @param message
     */
    verbose(message: string | (() => string)) {
      if (!shouldBeVerbose) return
      if (typeof message === 'function') {
        // eslint-disable-next-line no-param-reassign
        message = message()
      }
      console.log(message)
    },
  }

  let copied = false
  let copyTargets: RollupPluginCopyTargetItem[] = []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function collectAndWatchingTargets(...args: unknown[]) {
    const self: any = this
    if (copyOnce && copied) {
      return
    }

    // Recollect copyTargets
    copyTargets = []
    if (Array.isArray(targets) && targets.length) {
      for (const target of targets) {
        if (!isPlainObject(target)) {
          throw new Error(`${stringify(target)} target must be an object`)
        }

        const { dest, rename, src, transform, ...restTargetOptions } = target

        if (!src || !dest) {
          throw new Error(
            `${stringify(target)} target must have "src" and "dest" properties`,
          )
        }

        if (
          rename &&
          typeof rename !== 'string' &&
          typeof rename !== 'function'
        ) {
          throw new Error(
            `${stringify(
              target,
            )} target's "rename" property must be a string or a function`,
          )
        }

        const matchedPaths = await globby(src, {
          expandDirectories: false,
          onlyFiles: false,
          ...globalGlobbyOptions,
          ...restTargetOptions,
        })

        if (matchedPaths.length) {
          for (const matchedPath of matchedPaths) {
            const destinations = Array.isArray(dest) ? dest : [dest]
            const generatedCopyTargets = await Promise.all(
              destinations.map(destination =>
                generateCopyTarget(matchedPath, destination, {
                  flatten,
                  rename,
                  transform,
                }),
              ),
            )
            copyTargets.push(...generatedCopyTargets)
          }
        }
      }
    }

    /**
     * Watching source files
     */
    for (const target of copyTargets) {
      const srcPath = path.resolve(target.src)
      self.addWatchFile(srcPath)
    }
  }

  /**
   * Do copy operation
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleCopy(...args: unknown[]) {
    if (copyOnce && copied) {
      return
    }

    if (copyTargets.length) {
      log.verbose(chalk.green('copied:'))

      for (const copyTarget of copyTargets) {
        const { contents, dest, src, transformed } = copyTarget

        if (transformed) {
          await fs.outputFile(dest, contents, globalGlobbyOptions)
        } else {
          await fs.copy(src, dest, globalGlobbyOptions as CopyOptions)
        }

        log.verbose(() => {
          let message = chalk.green(
            `  ${chalk.bold(src)} → ${chalk.bold(dest)}`,
          )
          const flags = Object.entries(copyTarget)
            .filter(
              ([key, value]) =>
                ['renamed', 'transformed'].includes(key) && value,
            )
            .map(([key]) => key.charAt(0).toUpperCase())

          if (flags.length) {
            message = `${message} ${chalk.yellow(`[${flags.join(', ')}]`)}`
          }

          return message
        })
      }
    } else {
      log.verbose(chalk.yellow('no items to copy'))
    }

    copied = true
  }

  const plugin = {
    name: 'copy',
    async [watchHook](...args: unknown[]) {
      const self = this
      await collectAndWatchingTargets.call(self, ...args)

      /**
       * Merge handleCopy and collectAndWatchingTargets
       */
      if (hook === watchHook) {
        await handleCopy.call(self, ...args)
      }
    },
  }

  if (hook !== watchHook) {
    plugin[hook] = handleCopy
  }
  return plugin
}
