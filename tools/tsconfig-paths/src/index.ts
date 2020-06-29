import fs from 'fs-extra'
import path from 'path'
import * as TsconfigUtil from 'tsconfig'
import { createMatchPath } from 'tsconfig-paths'
import { correctModulePath } from './util'
export { correctModulePath } from './util'


export interface Paths {
  readonly [key: string]: string[]
}


export class TsconfigPathAliasResolver {
  public readonly cwd: string
  public readonly tsconfig: any
  public readonly encoding: string
  public readonly projectDir: string
  public readonly rootDir: string
  public readonly absoluteBaseUrl: string | undefined
  public readonly paths: Paths | undefined

  public constructor(
    cwd: string,
    tsconfigPath?: string,
    encoding?: string
  ) {
    const { path: configPath, config } = TsconfigUtil.loadSync(cwd, tsconfigPath)
    this.cwd = cwd
    this.tsconfig = config
    this.encoding = encoding || 'utf-8'
    this.projectDir = path.dirname(configPath || '') || cwd
    this.rootDir = config?.compilerOptions?.rootDir || '.'
    this.absoluteBaseUrl = config?.compilerOptions?.baseUrl
    this.paths = config?.compilerOptions?.paths
  }

  public async processDts(dtsRootPath?: string, needProcessExtensions: string[] = ['.d.ts']): Promise<void> {
    const self = this
    if (self.absoluteBaseUrl == null || self.paths == null) return
    if (dtsRootPath == null) {
      const { declarationDir, outDir } = self.tsconfig?.compilerOptions || {}
      // eslint-disable-next-line no-param-reassign
      dtsRootPath = declarationDir || outDir
    }
    if (dtsRootPath == null) {
      throw new Error('no valid declarationDir found.')
    }

    // eslint-disable-next-line no-param-reassign
    dtsRootPath = path.resolve(self.projectDir, dtsRootPath)
    if (!fs.existsSync(dtsRootPath)) {
      throw new Error('no valid declarationDir found.')
    }

    // eslint-disable-next-line no-param-reassign
    const absoluteBaseUrl = path.resolve(self.projectDir, self.absoluteBaseUrl)
    const rootDir = path.resolve(self.projectDir, self.rootDir)
    const paths = self.paths

    const extensions = Object.keys(require.extensions).concat(['.ts', '.d.ts'])
    // transform path alias
    const match = createMatchPath(absoluteBaseUrl, paths)
    const transform = (srcFilePath: string, requiredFilePath: string): string => {
      const resolvedPath: string | undefined = match(requiredFilePath, undefined, undefined, extensions)
      if (resolvedPath == null) return requiredFilePath
      const srcDirPath = path.dirname(
        path.resolve(rootDir, path.relative(dtsRootPath!, srcFilePath)))
      const relativePath = path.relative(srcDirPath, resolvedPath)
      return path.normalize(relativePath).replace(/^([^.])/, '.' + path.sep + '$1')
    }

    // process single *.d.ts file
    const processFile = async (filePath: string): Promise<void> => {
      const content: string = await fs.readFile(filePath, self.encoding)
      const resolvedContent: string = correctModulePath(
        content,
        (modulePath: string) => transform(filePath, modulePath))
      await fs.writeFile(filePath, resolvedContent, self.encoding)
    }

    // process *.d.ts directory
    const process = async (dir: string): Promise<void> => {
      const files = fs.readdirSync(dir)
      const tasks: Promise<void>[] = []
      for (const filename of files) {
        const filePath = path.join(dir, filename)
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
          const task = process(filePath)
          tasks.push(task)
          continue
        }
        if (stat.isFile()) {
          if (needProcessExtensions.find(ext => filename.endsWith(ext)) == null) continue
          const task = processFile(filePath)
          tasks.push(task)
        }
      }
      await Promise.all(tasks)
    }

    await process(dtsRootPath)
  }
}
