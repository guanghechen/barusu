# typescript-json-schema

[![npm version](https://img.shields.io/npm/v/@barusu/typescript-json-schema.svg)](https://www.npmjs.com/package/@barusu/typescript-json-schema)

Generate json-schemas from your Typescript sources.

I sincerely suggest you use [the original repository](https://github.com/YousefED/typescript-json-schema), as this repository/package is forked for demanding of myself (study and customization).

Peer Commit Id: https://github.com/YousefED/typescript-json-schema/commit/ddeabea7958975ab50de5a54cb8184399ec17031

## Features

* Compiles your Typescript program to get complete type information.
* Translates required properties, extends, annotation keywords, property initializers as defaults. You can find examples for these features in the [test examples](https://github.com/YousefED/typescript-json-schema/tree/master/test/programs).

## Usage

### Programmatic use

```ts
import { resolve } from 'path'
import * as TJS from '@barusu/typescript-json-schema'

// optionally pass argument to schema generator
const settings: TJS.PartialArgs = {
  ref: false,
  required: true,
}

// optionally pass ts compiler options
const compilerOptions: TJS.CompilerOptions = {
  strictNullChecks: true
}

// optionally pass a base path
const basePath = './my-dir'

const program = TJS.getProgramFromFiles([resolve('my-file.ts')], compilerOptions, basePath)

// We can either get the schema for one file and one type...
const schema = TJS.generateSchema(program, 'MyType', settings)


// ... or a generator that lets us incrementally get more schemas

const generator = TJS.buildGenerator(program, settings)

// all symbols
const symbols = generator.getUserSymbols()

// Get symbols for different types from generator.
generator.getSchemaForSymbol('MyType')
generator.getSchemaForSymbol('AnotherType')
```

```ts
// In larger projects type names may not be unique,
// while unique names may be enabled.
const settings: TJS.PartialArgs = {
  uniqueNames: true
}

const generator = TJS.buildGenerator(program, settings)

// A list of all types of a given name can then be retrieved.
const symbolList = generator.getSymbols('MyType')

// Choose the appropriate type, and continue with the symbol's unique name.
generator.getSchemaForSymbol(symbolList[1].name)

// Also it is possible to get a list of all symbols.
const fullSymbolList = generator.getSymbols()
```

`getSymbols('<SymbolName>')` and `getSymbols()` return an array of `SymbolRef`, which is of the following format:

```ts
type SymbolRef = {
  name: string
  typeName: string
  fullyQualifiedName: string
  symbol: ts.Symbol
}
```

`getUserSymbols` and `getMainFileSymbols` return an array of `string`.

### Annotations

The schema generator converts annotations to JSON schema properties.

For example

```ts
export interface Shape {
  /**
   * The size of the shape.
   *
   * @minimum 0
   * @TJS-type integer
   */
  size: number
}
```

will be translated to

```json
{
  "$ref": "#/definitions/Shape",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "Shape": {
      "properties": {
        "size": {
          "description": "The size of the shape.",
          "minimum": 0,
          "type": "integer"
        }
      },
      "type": "object"
    }
  }
}
```

Note that we needed to use `@TJS-type` instead of just `@type` because of an [issue with the typescript compiler](https://github.com/Microsoft/TypeScript/issues/13498).

## Background

Inspired and builds upon [Typson](https://github.com/lbovet/typson/), but typescript-json-schema is compatible with more recent Typescript versions. Also, since it uses the Typescript compiler internally, more advanced scenarios are possible. If you are looking for a library that uses the AST instead of the type hierarchy and therefore better support for type aliases, have a look at [vega/ts-json-schema-generator](https://github.com/vega/ts-json-schema-generator).
