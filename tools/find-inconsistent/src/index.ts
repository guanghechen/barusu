import fs from 'fs-extra'
import glob from 'glob'
import path from 'path'
import './env/constant'
import { logger } from './env/logger'
import { checkFatalError } from './util'
export * from './env/constant'
export * from './env/logger'
export * from './util'

export type PackageDependencies = { [name: string]: string }
export type DependencyItem = {
  version: string
  dependents: string[]
}

export interface PackageJSON {
  name: string
  version: string
  bundledDependencies?: PackageDependencies
  dependencies?: PackageDependencies
  devDependencies?: PackageDependencies
  optionalDependencies?: PackageDependencies
  peerDependencies?: PackageDependencies
}

export class PackageManager {
  protected readonly packageMap: Map<string, string> = new Map()
  protected readonly dependencyMap: Map<string, DependencyItem> = new Map()

  public async resolve(rootPackageJsonPath: string): Promise<void> {
    if (!fs.existsSync(rootPackageJsonPath)) {
      throw new Error(`${rootPackageJsonPath} is not found.`)
    }

    const self = this
    self.packageMap.clear()
    self.dependencyMap.clear()
    const manifest = fs.readJSONSync(rootPackageJsonPath)
    self.resolvePackageJSON(manifest)

    if (manifest.workspaces == null) {
      throw new Error(
        `workspaces field is not specified in ${rootPackageJsonPath}`,
      )
    }

    const tasks: Promise<void>[] = []
    for (const workspace of manifest.workspaces) {
      const task = new Promise<void>((resolve, reject) => {
        glob(workspace, (err: any, files: string[]) => {
          if (err) {
            reject(err)
            return
          }

          for (const filePath of files) {
            const packageJsonPath = path.join(filePath, 'package.json')
            if (!fs.existsSync(packageJsonPath)) {
              logger.warn(`no package.json found in ${filePath}`)
              continue
            }

            const json = fs.readJSONSync(packageJsonPath)
            self.resolvePackageJSON(json)
          }
          resolve()
        })
      })
      tasks.push(task)
    }

    await Promise.all(tasks)
    self.checkPackageVersion()
  }

  protected resolvePackageJSON(json: PackageJSON): void {
    const self = this
    self.packageMap.set(json.name, json.version)
    const keys: (keyof PackageJSON)[] = [
      'bundledDependencies',
      'dependencies',
      'devDependencies',
      'optionalDependencies',
      'peerDependencies',
    ]

    const dependencies: PackageDependencies = {}
    for (const key of keys) {
      const currentDependencies = json[key] as PackageDependencies
      if (currentDependencies == null) continue
      for (const [dependency, version] of Object.entries(currentDependencies)) {
        if (dependencies[dependency] == null) {
          dependencies[dependency] = version
          continue
        }
        if (dependencies[dependency] !== version) {
          logger.error(
            `[${json.name}] ${dependency} has difference versions:`,
            `(${dependencies[dependency]}), (${version})`,
          )
          process.exit(-1)
        }
      }
    }

    let hasError = false
    for (const [dependency, version] of Object.entries(dependencies)) {
      const dependencyItem: DependencyItem | undefined = self.dependencyMap.get(
        dependency,
      )

      // new dependency
      if (dependencyItem == null) {
        self.dependencyMap.set(dependency, {
          version,
          dependents: [json.name],
        })
        continue
      }

      // Consistent version number of the same dependency in other packages.
      if (dependencyItem.version === version) {
        dependencyItem.dependents.push(json.name)
        continue
      }

      // eslint-disable-next-line max-len
      // Inconsistent version number of the same dependency in other packages found.
      logger.error(
        `[${json.name}] ${dependency} has a different version(${version}) in other packages:`,
        dependencyItem.dependents
          .map(d => `${d}(${dependencyItem.version})`)
          .join(','),
      )
      hasError = true
    }

    // check for errors
    checkFatalError(hasError)
  }

  protected checkPackageVersion(): void {
    const self = this
    let hasError = false
    for (const [packageName, version] of self.packageMap.entries()) {
      const dependencyItem = self.dependencyMap.get(packageName)
      if (dependencyItem == null) continue

      // There is no '^' prefix of the field 'version' in package.version
      const normalizedDependencyVersion = dependencyItem.version.replace(
        /^[^]/,
        '',
      )
      if (normalizedDependencyVersion === version) continue

      logger.error(
        `[${packageName}] has a different version(${version}) in other packages:`,
        dependencyItem.dependents
          .map(d => `${d}(${dependencyItem.version})`)
          .join(','),
      )
      hasError = true
    }
    checkFatalError(hasError)
  }
}
