import ts from 'typescript'
import { SymbolRef, SchemaArgs, ValidationKeywords, Definition, ObjectMap } from './types'
import { getTypeDefinition } from './definition/type-definition'


/**
 *
 * @member checker
 * @member args
 * @member symbols            holds all symbols within a custom SymbolRef object, containing useful information
 * @member allSymbols         all types for declarations of classes, interfaces, enums, and type aliases defined in all TS files
 * @member userSymbols        all symbols for declarations of classes, interfaces, enums, and type aliases defined in non-default-lib TS files
 * @member typeNamesById      map from type IDs to type names
 * @member typeIdsByName      map from type names to type IDs
 * @member reffedDefinitions  map from symbol name to definitions
 * @member reffedDependencies map from symbol names to its refDependencies symbols' name
 */
export class JsonSchemaContext {
  private readonly reffedDefinitions: Map<string, Definition> = new Map()
  private readonly reffedDefinitionNamesMap: Map<string, string[]> = new Map()
  private readonly typeNamesById: Map<number, string> = new Map()
  private readonly typeIdsByName: Map<string, number> = new Map()
  public readonly inheritingTypes: Readonly<ObjectMap<string[]>>
  public readonly symbols: Readonly<SymbolRef[]> = []
  public readonly allSymbols: Readonly<ObjectMap<ts.Type>>
  public readonly userSymbols: Readonly<ObjectMap<ts.Symbol>>
  public readonly args: Readonly<SchemaArgs>
  public readonly checker: Readonly<ts.TypeChecker>
  public readonly validationKeywords: Readonly<ValidationKeywords>
  public readonly userValidationKeywords: Readonly<ValidationKeywords>
  public readonly REGEX_FILE_NAME_OR_SPACE = /(\bimport\(".*?"\)|".*?")\.| /
  public readonly REGEX_TJS_JSDOC_NAME = /^TJS(?:-([\w]+))?$/
  public readonly REGEX_TJS_JSDOC_CONTENT = /^\s*(\S|\S[\s\S]*\S)\s*$/
  public readonly REGEX_LINE_BREAK = /\r\n/
  public readonly NUMERIC_INDEX_PATTERN = '^[0-9]+$'

  public constructor(
    validationKeywords: Readonly<ValidationKeywords>,
    symbols: Readonly<SymbolRef[]>,
    allSymbols: Readonly<ObjectMap<ts.Type>>,
    userSymbols: Readonly<ObjectMap<ts.Symbol>>,
    inheritingTypes: Readonly<ObjectMap<string[]>>,
    checker: Readonly<ts.TypeChecker>,
    args: Readonly<SchemaArgs>,
  ) {
    const userValidationKeywords = args.validationKeywords.reduce((acc, word) => ({ ...acc, [word]: true, }), {})
    this.userValidationKeywords = Object.freeze({ ...userValidationKeywords })
    this.validationKeywords = Object.freeze({ ...validationKeywords })
    this.args = Object.freeze({ ...args })
    this.symbols = Object.freeze([...symbols])
    this.allSymbols = Object.freeze({ ...allSymbols })
    this.userSymbols = Object.freeze({ ...userSymbols })
    this.inheritingTypes = Object.freeze({ ...inheritingTypes })
    this.checker = checker
  }

  public getReffedDefinition(name: string): Definition | undefined {
    return this.reffedDefinitions.get(name)
  }

  public setReffedDefinition(name: string, definition: Definition): void {
    this.reffedDefinitions.set(name, definition)
  }

  public setSchemaOverride(symbolName: string, schema: Definition): void {
    this.setReffedDefinition(symbolName, schema)
  }

  public getSchemaForSymbol(symbolName: string, includeReffedDefinitions = true): Definition {
    if (!this.allSymbols[symbolName]) {
      throw new Error(`type ${ symbolName } not found`)
    }
    const def = getTypeDefinition(
      this,
      this.allSymbols[symbolName],
      this.args.topRef,
      undefined,
      undefined,
      undefined,
      this.userSymbols[symbolName] || undefined
    )
    if (this.args.ref && includeReffedDefinitions && this.reffedDefinitions.size > 0) {
      const reffedDefinitionNames: string[] = this.collectReffedDefinitionNames(symbolName, def)
      def.definitions = reffedDefinitionNames.reverse().reduce((acc, k) => {
        // eslint-disable-next-line no-param-reassign
        acc[k] = this.getReffedDefinition(k)
        return acc
      }, {})
    }
    def['$schema'] = 'http://json-schema.org/draft-07/schema#'
    if (this.args.id) def['$id'] = this.args.id
    return def
  }

  public getSchemaForSymbols(symbolNames: string[], includeReffedDefinitions = true): Definition {
    const root = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: {},
    }

    if (Boolean(this.args.id)) {
      root['$id'] = this.args.id
    }

    for (const symbolName of symbolNames) {
      root.definitions[symbolName] = getTypeDefinition(
        this,
        this.allSymbols[symbolName],
        this.args.topRef,
        undefined,
        undefined,
        undefined,
        this.userSymbols[symbolName]
      )
    }

    if (this.args.ref && includeReffedDefinitions && this.reffedDefinitions.size > 0) {
      root.definitions = { ...root.definitions, ...this.reffedDefinitions }
    }
    return root
  }

  public getSymbols(name?: string): SymbolRef[] {
    if (name == null) return [...this.symbols]
    return this.symbols.filter(symbol => symbol.typeName === name)
  }

  public getUserSymbols(name?: string): string[] {
    if (name == null) return [...Object.keys(this.userSymbols)]
    return [...Object.keys(this.userSymbols)].filter(typeName => typeName === name)
  }

  /**
   *
   * @param prop
   */
  public getReferencedTypeSymbol(prop: ts.Symbol): ts.Symbol | undefined {
    const decl = prop.getDeclarations()
    if (decl && decl.length) {
      const type = (decl[0] as any).type as ts.TypeReferenceNode
      if (type && (type.kind & ts.SyntaxKind.TypeReference) && type.typeName) {
        const symbol = this.checker.getSymbolAtLocation(type.typeName)
        if (symbol && (symbol.flags & ts.SymbolFlags.Alias)) {
          return this.checker.getAliasedSymbol(symbol)
        }
        return symbol
      }
    }
    return undefined
  }

  /**
   * 获取指定文件列表下的 symbols
   * @param program
   * @param onlyIncludeFiles
   */
  public getMainFileSymbols(program: ts.Program, onlyIncludeFiles?: string[]): string[] {
    function includeFile(file: ts.SourceFile): boolean {
      if (onlyIncludeFiles == null) return !file.isDeclarationFile
      return onlyIncludeFiles.includes(file.fileName)
    }
    const files = program.getSourceFiles().filter(includeFile)
    if (files.length) {
      return this.getUserSymbols().filter(key => {
        const symbol = this.userSymbols[key]
        if (!symbol || !symbol.declarations || !symbol.declarations.length) return false
        let node: ts.Node = symbol.declarations[0]
        while (node && node.parent) node = node.parent
        return files.includes(node.getSourceFile())
      })
    }
    return []
  }

  /**
   * 通过 ts 的 type 对象，生成一个对应的名称
   *  - 若该 type 对象已有名称，则返回该名称
   *  - 否则，生成一个唯一的名称
   * @param type
   */
  public getTypeName(type: ts.Type): string {
    const id = (type as any).id as number
    let typeName: string | undefined = this.typeNamesById.get(id)
    if (typeName != null) return typeName

    typeName = this.checker
      .typeToString(
        type,
        undefined,
        ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseFullyQualifiedType
      )
      .replace(new RegExp(this.REGEX_FILE_NAME_OR_SPACE, 'g'), '')
    return this.makeTypeNameUnique(type, typeName)
  }

  /**
   * 为 type 生成一个唯一的名称：即使已存在了对应的 type.id，仍需要继续执行函数，
   * 并将新生成的 name 覆盖原 id 对应的 name
   *
   * @param type
   * @param originName  初始时的名称（源文件中定义的名称）
   */
  public makeTypeNameUnique(type: ts.Type, originName: string): string {
    const id = (type as any).id as number
    let name = originName
    for (let order = 1; this.typeIdsByName.get(name) != null && this.typeIdsByName.get(name) !== id;) {
      name = `${ originName }_${ order++ }`
    }
    this.typeNamesById.set(id, name)
    this.typeIdsByName.set(name, id)
    return name
  }

  /**
   * Find all referenced definitions for the given definition
   * @param definition
   */
  public collectReffedDefinitionNames(defName: string, definition: Definition): string[] {
    const self = this

    // avoid duplicated computed
    const reffedDefinitionNames: string[] = this.reffedDefinitionNamesMap.get(defName) || []
    if (reffedDefinitionNames.length > 0) return reffedDefinitionNames

    // if the definition is in reffedDefinitions, then append itself to the reffedDefinitionNames
    if (self.getReffedDefinition(defName) != null) {
      reffedDefinitionNames.push(defName)
      // eslint-disable-next-line no-param-reassign
      definition = self.getReffedDefinition(defName)!
      this.reffedDefinitionNamesMap.set(defName, reffedDefinitionNames)
    }

    // Traverse the properties in the Definition to find all the reference definitions
    const regex = /#\/definitions\/([^/\s]+)$/
    JSON.stringify(definition, (key: string, val: any) => {
      if (key === '$ref' && typeof val === 'string') {
        const match = regex.exec(val)
        if (match == null) return
        const [, refName] = match
        if (reffedDefinitionNames.indexOf(refName) < 0) {
          const names = self.collectReffedDefinitionNames(refName, definition)
          reffedDefinitionNames.push(refName)
          for (const name of names) {
            if (reffedDefinitionNames.indexOf(name) >= 0) continue
            reffedDefinitionNames.push(name)
          }
        }
      }
      return val
    })
    return reffedDefinitionNames
  }
}
