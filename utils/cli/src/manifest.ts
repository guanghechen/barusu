import fs from 'fs-extra'
import path from 'path'
import { Logger } from './types'


/**
 * Follow the ancestor node to find the path where package.json is located.
 * null will be returned if the package.json is not found.
 */
export function findPackageJsonPath(p: string): string | null {
  const target = path.join(p, 'package.json')
  if (fs.existsSync(target)) return target
  const dirname = path.dirname(p)
  if (dirname === p) return null
  return findPackageJsonPath(dirname)
}


/**
 * Find all dependencies
 */
export function collectAllDependencies(
  packageJsonPath?: string,
  additionalDependencies?: string[],
  dependenciesFields: string[] = ['dependencies'],
  ignoredModuleRegex = /^@types\//,
  logger?: Logger
): string[] {
  const result: string[] = []

  // collect from package.json
  if (packageJsonPath != null) {
    collectDependencies(packageJsonPath)
  }

  // collect from dependencies
  if (additionalDependencies != null) {
    for (const dependency of additionalDependencies) {
      followDependency(dependency)
    }
  }

  return result


  function followDependency(dependency: string): void {
    if (result.includes(dependency)) return
    result.push(dependency)

    // recursively collect
    let nextPackageJsonPath: string | null = null
    try {
      const dependencyPath = require.resolve(dependency)
      nextPackageJsonPath = findPackageJsonPath(dependencyPath)
    } catch (e) {
      if (e.code !== 'MODULE_NOT_FOUND') {
        console.error(e)
        return
      }
      if (ignoredModuleRegex.test(dependency)) {
        return
      }
    }
    if (nextPackageJsonPath == null) {
      if (logger != null && logger.warn != null) {
        logger.warn('cannot find package.json for {}', dependency)
      }
      return
    }

    collectDependencies(nextPackageJsonPath)
  }

  function collectDependencies(dependencyPackageJsonPath: string): void {
    if (!fs.existsSync(dependencyPackageJsonPath)) {
      if (logger != null && logger.warn != null) {
        logger.warn('no such file or directory: {}', dependencyPackageJsonPath)
      }
      return
    }

    const manifest = fs.readJSONSync(dependencyPackageJsonPath)
    for (const fieldName of dependenciesFields) {
      const field = manifest[fieldName]
      if (field != null) {
        for (const dependency of Object.keys(field)) {
          followDependency(dependency)
        }
      }
    }
  }
}
