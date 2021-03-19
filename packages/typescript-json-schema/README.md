<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/barusu/tree/master/packages/typescript-json-schema#readme">@barusu/typescript-json-schema</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@barusu/typescript-json-schema">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@barusu/typescript-json-schema.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/typescript-json-schema">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@barusu/typescript-json-schema.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/typescript-json-schema">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@barusu/typescript-json-schema.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@barusu/typescript-json-schema"
      />
    </a>
    <a href="https://github.com/tj/commander.js/">
      <img
        alt="React version"
        src="https://img.shields.io/npm/dependency-version/@barusu/typescript-json-schema/typescript"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Tested with Jest"
        src="https://img.shields.io/badge/tested_with-jest-9c465e.svg"
      />
    </a>
    <a href="https://github.com/prettier/prettier">
      <img
        alt="Code Style: prettier"
        src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
      />
    </a>
  </div>
</header>
<br/>


# typescript-json-schema

[![npm version](https://img.shields.io/npm/v/@barusu/typescript-json-schema.svg)](https://www.npmjs.com/package/@barusu/typescript-json-schema)

Generate json-schemas from your Typescript sources.

I sincerely suggest you use [the original repository](https://github.com/YousefED/typescript-json-schema), as this repository/package is forked for demanding of myself (study and customization).

Peer Commit Id: https://github.com/YousefED/typescript-json-schema/commit/9203bed4b22913e1a2b34a16b1f73a33faccdaad

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

You can also override the type of array items, either listing each field in its own annotation or one
annotation with the full JSON of the spec (for special cases). This replaces the item types that would
have been inferred from the TypeScript type of the array elements.

Example:

```ts
export interface ShapesData {
    /**
     * Specify individual fields in items.
     *
     * @items.type integer
     * @items.minimum 0
     */
    sizes: number[];

    /**
     * Or specify a JSON spec:
     *
     * @items {"type":"string","format":"email"}
     */
    emails: string[];
}
```

Translation:

```json
{
    "$ref": "#/definitions/ShapesData",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "Shape": {
            "properties": {
                "sizes": {
                    "description": "Specify individual fields in items.",
                    "items": {
                        "minimum": 0,
                        "type": "integer"
                    },
                    "type": "array"
                },
                "emails": {
                    "description": "Or specify a JSON spec:",
                    "items": {
                        "format": "email",
                        "type": "string"
                    },
                    "type": "array"
                }
            },
            "type": "object"
        }
    }
}
```

This same syntax can be used for `contains` and `additionalProperties`.

### `integer` type alias

If you create a type alias `integer` for `number` it will be mapped to the `integer` type in the generated JSON schema.

Example:

```typescript
type integer = number;
interface MyObject {
    n: integer;
}
```

Note: this feature doesn't work for generic types & array types, it mainly works in very simple cases.

### `require` a variable from a file

(for requiring typescript files is needed to set argument `tsNodeRegister` to true)

When you want to import for example an object or an array into your property defined in annotation, you can use `require`.

Example:

```ts
export interface InnerData {
    age: number;
    name: string;
    free: boolean;
}

export interface UserData {
    /**
     * Specify required object
     *
     * @examples require("./example.ts").example
     */
    data: InnerData;
}
```

file `example.ts`

```ts
export const example: InnerData[] = [{
  age: 30,
  name: "Ben",
  free: false
}]
```

Translation:

```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "properties": {
        "data": {
            "description": "Specify required object",
            "examples": [
                {
                    "age": 30,
                    "name": "Ben",
                    "free": false
                }
            ],
            "type": "object",
            "properties": {
                "age": { "type": "number" },
                "name": { "type": "string" },
                "free": { "type": "boolean" }
            },
            "required": ["age", "free", "name"]
        }
    },
    "required": ["data"],
    "type": "object"
}
```

Also you can use `require(".").example`, which will try to find exported variable with name 'example' in current file. Or you can use `require("./someFile.ts")`, which will try to use default exported variable from 'someFile.ts'.

Note: For `examples` a required variable must be an array.
