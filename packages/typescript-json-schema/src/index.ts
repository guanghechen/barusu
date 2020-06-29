import fs from 'fs'
import path from 'path'
import glob from 'glob'
import stringify from 'json-stable-stringify'
import ts from 'typescript'
import { SymbolRef, Definition, PartialArgs } from './types'
import { getDefaultArgs } from './config'
import { generateHashOfNode, normalizeFileName } from './util'
import { JsonSchemaGenerator } from './schema-generator'
export { CompilerOptions, Program, Symbol } from 'typescript'
export { Definition, PartialArgs, SymbolRef } from './types'
export { JsonSchemaGenerator } from './schema-generator'
export { getDefaultArgs } from './config'


export function getProgramFromFiles(files: string[], jsonCompilerOptions: any = {}, basePath = './'): ts.Program {
  // use built-in default options
  const compilerOptions = ts.convertCompilerOptionsFromJson(jsonCompilerOptions, basePath).options
  const options: ts.CompilerOptions = {
    noEmit: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    allowUnusedLabels: true,
  }
  for (const k in compilerOptions) {
    if (compilerOptions.hasOwnProperty(k)) {
      options[k] = compilerOptions[k]
    }
  }
  return ts.createProgram(files, options)
}


export function buildGenerator(program: ts.Program, args: PartialArgs = {}, onlyIncludeFiles?: string[]): JsonSchemaGenerator | null {
  const isUserFile = (file: ts.SourceFile): boolean => {
    if (onlyIncludeFiles === undefined) {
      return !file.hasNoDefaultLib
    }
    return onlyIncludeFiles.indexOf(file.fileName) >= 0
  }

  // Use defaults unless otherwise specified
  const settings = { ...getDefaultArgs(), ...args }

  let diagnostics: ReadonlyArray<ts.Diagnostic> = []
  if (!args.ignoreErrors) {
    diagnostics = ts.getPreEmitDiagnostics(program)
  }

  if (diagnostics.length === 0) {
    const typeChecker = program.getTypeChecker()

    const symbols: SymbolRef[] = []
    const allSymbols: { [name: string]: ts.Type } = {}
    const userSymbols: { [name: string]: ts.Symbol } = {}
    const inheritingTypes: { [baseName: string]: string[] } = {}
    const workingDir = program.getCurrentDirectory()

    program.getSourceFiles().forEach(sourceFile => {
      const relativePath = path.relative(workingDir, sourceFile.fileName)

      function inspect(node: ts.Node, checker: ts.TypeChecker) {
        if (node.kind === ts.SyntaxKind.ClassDeclaration
          || node.kind === ts.SyntaxKind.InterfaceDeclaration
          || node.kind === ts.SyntaxKind.EnumDeclaration
          || node.kind === ts.SyntaxKind.TypeAliasDeclaration
        ) {
          const symbol: ts.Symbol = (node as any).symbol
          const nodeType = checker.getTypeAtLocation(node)
          const fullyQualifiedName = checker.getFullyQualifiedName(symbol)
          const typeName = fullyQualifiedName.replace(/".*"\./, '')
          const name = !args.uniqueNames ? typeName : `${ typeName }.${ generateHashOfNode(node, relativePath) }`

          symbols.push({ name, typeName, fullyQualifiedName, symbol })
          if (!userSymbols[name]) {
            allSymbols[name] = nodeType
          }

          if (isUserFile(sourceFile)) {
            userSymbols[name] = symbol
          }

          const baseTypes = nodeType.getBaseTypes() || []
          for (const baseType of baseTypes) {
            const baseName = checker.typeToString(baseType, undefined, ts.TypeFormatFlags.UseFullyQualifiedType)
            if (!inheritingTypes[baseName]) {
              inheritingTypes[baseName] = []
            }
            inheritingTypes[baseName].push(name)
          }
        } else {
          ts.forEachChild(node, n => inspect(n, checker))
        }
      }
      inspect(sourceFile, typeChecker)
    })

    return new JsonSchemaGenerator(symbols, allSymbols, userSymbols, inheritingTypes, typeChecker, settings)
  } else {
    diagnostics.forEach((diagnostic) => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      if (diagnostic.file) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!)
        console.error(`${ diagnostic.file.fileName } (${ line + 1 },${ character + 1 }): ${ message }`)
      } else {
        console.error(message)
      }
    })
    return null
  }
}


export function generateSchema(
  program: ts.Program,
  fullTypeName: string,
  args: PartialArgs = {},
  onlyIncludeFiles?: string[]
): Definition | null {
  const generator = buildGenerator(program, args, onlyIncludeFiles)
  if (generator === null) return null

  // All types in file(s)
  if (fullTypeName === '*') {
    return generator.getSchemaForSymbols(generator.getMainFileSymbols(program, onlyIncludeFiles))
  }

  // Use specific type as root object
  return generator.getSchemaForSymbol(fullTypeName)
}


/**
 * build ts.Program from tsconfig
 * @param configFileName    location of tsconfig.json
 * @param onlyIncludeFiles  only include these specified files
 */
export function programFromConfig(configFileName: string, onlyIncludeFiles?: string[]): ts.Program {
  // basically a copy of https://github.com/Microsoft/TypeScript/blob/3663d400270ccae8b69cbeeded8ffdc8fa12d7ad/src/compiler/tsc.ts -> parseConfigFile
  const result = ts.parseConfigFileTextToJson(configFileName, ts.sys.readFile(configFileName)!)
  const configObject = result.config

  const configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, path.dirname(configFileName), {}, path.basename(configFileName))

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { out, outDir, outFile, declaration, declarationDir, declarationMap, ...restOptions } = configParseResult.options
  restOptions.noEmit = true

  const program = ts.createProgram({
    rootNames: onlyIncludeFiles || configParseResult.fileNames,
    options: restOptions,
    projectReferences: configParseResult.projectReferences
  })
  return program
}

const REGEX_TSCONFIG_NAME = /^.*\.json$/
export function exec(
  filePattern: string,
  fullTypeName: string,
  args = getDefaultArgs(),
  stringifyOptions: stringify.Options = { space: 2 }
): void {
  let program: ts.Program
  let onlyIncludeFiles: string[] | undefined = undefined
  if (REGEX_TSCONFIG_NAME.test(path.basename(filePattern))) {
    if (args.include && args.include.length > 0) {
      const globs: string[][] = args.include.map(f => glob.sync(f))
      onlyIncludeFiles = ([] as string[]).concat(...globs).map(normalizeFileName)
    }
    program = programFromConfig(filePattern, onlyIncludeFiles)
  } else {
    onlyIncludeFiles = glob.sync(filePattern)
    program = getProgramFromFiles(onlyIncludeFiles, {
      strictNullChecks: args.strictNullChecks
    })
    onlyIncludeFiles = onlyIncludeFiles.map(normalizeFileName)
  }

  const definition = generateSchema(program, fullTypeName, args, onlyIncludeFiles)
  if (definition === null) {
    throw new Error('No output definition. Probably caused by errors prior to this?')
  }

  const json = stringify(definition, stringifyOptions) + '\n\n'
  if (args.out) {
    fs.writeFile(args.out, json, err => {
      if (err) {
        throw new Error('Unable to write output file: ' + err.message)
      }
    })
  } else {
    process.stdout.write(json)
  }
}
