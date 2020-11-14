[![npm version](https://img.shields.io/npm/v/@barusu/configuration-master.svg)](https://www.npmjs.com/package/@barusu/configuration-master)
[![npm download](https://img.shields.io/npm/dm/@barusu/configuration-master.svg)](https://www.npmjs.com/package/@barusu/configuration-master)
[![npm license](https://img.shields.io/npm/l/@barusu/configuration-master.svg)](https://www.npmjs.com/package/@barusu/configuration-master)


# Introduction
* This package is to solve the verification problem of the configuration file. When developing a generic library or tool, there are usually the following steps in its use:
  - Developer writes the configuration file (let's call it DS) for "Defining Profile Data Mode"
  - User writes a configuration file (let's call it C)
  - In the developer's program, the validity of C is verified by DS, and normalized to get D, using D as the current configuration of the program.
  - If there is an error in the process of verifying C, you must return a complete error message (in fact, DS will be checked once during initialization, so there is also an error message object for DS verification)

* So there are four types:
  - DataSchema: defines the data schema of the configuration file, similar to JSON-SCHEMA, the subsequent goal is to basically support the properties in JSON-SCHEMA
  - DataSchemaCompiler: compiles the data schema of the developer-defined configuration file into DataSchema
  - DataValidator: Validate the given data with DataSchema to determine if it meets the definition in DataSchema, and do the appropriate normalization
  - HandleResult: The result of parsing/verification, containing three attributes:
    - value: The final result, the value will be set only when no error occurs during the parsing/verification process; the given data may be formatted as needed during the verification process, such as: when an attribute in a given data is missing, set the corresponding default value as defined in DataSchema
    - errors: errors generated during parsing (documents to be supplemented, can be understood by looking at [source code of DataHandleResult][DataHandleResult])
    - warnings: warning messages generated during parsing (documents to be supplemented, can be understood by looking at [source code of DataHandleResult][DataHandleResult])

---

* 这个库是为了解决配置文件的校验问题。在开发通用库或者工具时，在使用上通常存在以下几个步骤：
  - 开发者编写【定义配置文件数据模式】的配置文件 DS
  - 使用者编写配置文件 C
  - 开发者的程序中通过 DS 来校验 C 的合法性，并做规范化处理得到 D，使用 D 作为程序的当前配置
  - 若校验 C 的过程中存在错误，则必须返回完善的错误信息（实际上初始化时会对 DS 进行一次校验，因此还有针对 DS 校验的错误信息对象）

* 因此有四种类型：
  - DataSchema: 定义配置文件的数据模式，类似 JSON-SCHEMA，后续的目标是基本支持 JSON-SCHEMA 中有的属性
  - DataSchemaCompiler: 将开发者定义的配置文件的数据模式编译成 DataSchema
  - DataValidator: 通过 DataSchema 对给定数据进行校验，判断其是否符合 DataSchema 中的定义；并做适当的规范化处理
  - HandleResult: 编译/校验的结果，包含三个属性：
    - value: 最终得到的结果，仅当编译/校验过程中未出现错误时才会设置值；在校验过程中可能会根据需要格式化给定的数据，如：当给定的数据中某个属性缺失时，按照 DataSchema 中的定义设置对应的默认值
    - errors: 编译过程中产生的错误（文档待补充，可通过查看 [DataHandleResult 源码][DataHandleResult] 来辅助理解）
    - warnings: 编译过程中产生的警告信息（文档待补充，可通过查看 [DataHandleResult 源码][DataHandleResult] 来辅助理解）

# usage

## install
  ```shell
  yarn add @barusu/configuration-master
  # or
  # npm install --save @barusu/configuration-master
  ```

## demo1
  ```typescript
  import { configurationMaster } from '@barusu/configuration-master'

  const rawSchema = {
    type: 'integer',
    minimum: -23,
    exclusiveMaximum: 23,
    default: 0
  }

  // compile rawSchema
  const { value: schema } = configurationMaster.compile(rawSchema)

  // validate data with schema
  const validate = (data: any): boolean | undefined => {
    const result = configurationMaster.validate(schema!, data)
    if (result.hasError) {
      console.error(result.errorDetails)
    }
    if (result.hasWarning) {
      console.error(result.warningDetails)
    }
    console.log('value:', result.value)
    return result.value
  }

  validate(undefined)   // 0;
  validate(1)           // 1;
  validate('0xf')       // 15;
  validate(23)          // undefined; and will print errors (`exclusiveMaximum` is not satisfied)
  validate(2.8)         // undefined; and will print errors (`type` is not satisfied)
  validate(-23)         // -23;
  validate(-24)         // undefined; and will print errors (`minimum` is not satisfied)
  validate([])          // undefined; and will print errors (`type` is not satisfied)
  ```

## demo2
  ```typescript
  import { configurationMaster } from '../../src'

  const rawSchema = {
    type: 'object',
    allowAdditionalProperties: true,
    silentIgnore: true,
    propertyNames: {
      type: 'string',
      enum: ['email', 'gender', 'sex']
    },
    properties: {
      name: {
        type: 'string',
        pattern: '^\\w{3,20}$',
        required: true,
      },
      age: 'integer'
    },
    dependencies: {
      email: ['age', 'gender']
    },
    required: true
  }


  // compile rawSchema
  const { value: schema } = configurationMaster.compile(rawSchema)

  // validate data with schema
  const validate = (data: any): boolean | undefined => {
    const result = configurationMaster.validate(schema!, data)
    if (result.hasError) {
      console.error(result.errorDetails)
    }
    if (result.hasWarning) {
      console.error(result.warningDetails)
    }
    console.log('value:', result.value)
    return result.value
  }

  validate(undefined)                                                               // undefined; and will print errors (`required` is not satisfied)
  validate({ name: 'alice', age: 20 })                                              // { name: 'alice', age: 20 };
  validate({ name: 'bob', gender: 'male' })                                         // { name: 'bob', gender: 'male' }
  validate({ name: 'joy', age: 33, more: 'something', sex: 'female' })              // { name: 'joy', age: 33, sex: 'female' }
  validate({ name: 'joy', email: 'joy@bob.com', more: 'something', sex: 'female' }) // undefined; and will print errors (`dependencies#email` is not satisfied)
  validate({ name: 'joy', email: 'joy@bob.com', age: 33, gender: 'female' })        // { name: 'joy', email: 'joy@bob.com', age: 33, gender: 'female' }
  validate(false)                                                                   // undefined; and will print errors (`type` is not satisfied)
  ```

## demo3
  ```typescript
  import { configurationMaster } from '../../src'

  const rawSchema = {
    type: 'ref',
    $ref: '#/definitions/node',
    required: true,
    definitions: {
      node: {
        type: 'object',
        $id: '##/node',
        properties: {
          name: {
            type: 'string',
            required: true
          },
          title: 'string',
          children: {
            type: 'array',
            items: {
              type: 'ref',
              $ref: '##/node'
            }
          }
        }
      }
    },
  }

  // compile rawSchema
  const { value: schema } = configurationMaster.compile(rawSchema)

  // validate data with schema
  const validate = (data: any): boolean | undefined => {
    const result = configurationMaster.validate(schema!, data)
    if (result.hasError) {
      console.error(result.errorDetails)
    }
    if (result.hasWarning) {
      console.error(result.warningDetails)
    }
    console.log('value:', JSON.stringify(result.value, null, 2))
    return result.value
  }

  validate(undefined)             // undefined; and will print errors (`required` is not satisfied)

  /**
   * result:
   * {
   *   "value": {
   *     "title": "alice",
   *     "name": "alice",
   *     "children": [
   *       {
   *         "name": "alice-1"
   *       },
   *       {
   *         "name": "alice-2",
   *         "children": [
   *           {
   *             "name": "alice-2-1",
   *             "children": [
   *               {
   *                 "name": "alice-2-1-1"
   *               }
   *             ]
   *           }
   *         ]
   *       }
   *     ]
   *   },
   *   "errors": [],
   *   "warnings": []
   * }
   */
  validate({
    "title": "alice",
    "name": "alice",
    "children": [
      {
        "name": "alice-1"
      },
      {
        "name": "alice-2",
        "children": [
          {
            "name": "alice-2-1",
            "children": [
              {
                "name": "alice-2-1-1"
              }
            ]
          }
        ]
      }
    ]
  })

  // undefined; and will print errors (`children.1.children.0.children.0.name` is not satisfied)
  validate({
    "title": "alice",
    "name": "alice",
    "children": [
      {
        "name": "alice-1"
      },
      {
        "name": "alice-2",
        "children": [
          {
            "name": "alice-2-1",
            "children": [
              {}
            ]
          }
        ]
      }
    ]
  })
  ```

# Schema Docs
* [schema][schema]:
  - [ArrayDataSchema][]
  - [BooleanDataSchema][]
  - [CombineDataSchema][]
  - [NullDataSchema][]
  - [NumberDataSchema][]
  - [IntegerDataSchema][]
  - [ObjectDataSchema][]
  - [RefDataSchema][]
  - [StringDataSchema][]
* [compiler][DataSchemaCompiler]
* [validator][DataValidator]


<!-- schemas -->
[ArrayDataSchema]: https://github.com/guanghechen/barusu/blob/master/packages/configuration-master/doc/schemas/array.md
[BooleanDataSchema]: https://github.com/guanghechen/barusu/blob/master/packages/configuration-master/doc/schemas/boolean.md
[CombineDataSchema]: https://github.com/guanghechen/barusu/blob/master/packages/configuration-master/doc/schemas/combine.md
[NullDataSchema]: https://github.com/guanghechen/barusu/blob/master/packages/configuration-master/doc/schemas/null.md
[NumberDataSchema]: https://github.com/guanghechen/barusu/blob/master/packages/configuration-master/doc/schemas/number.md
[IntegerDataSchema]: https://github.com/guanghechen/barusu/blob/master/packages/configuration-master/doc/schemas/integer.md
[ObjectDataSchema]: https://github.com/guanghechen/barusu/blob/master/packages/configuration-master/doc/schemas/object.md
[RefDataSchema]: https://github.com/guanghechen/barusu/blob/master/packages/configuration-master/doc/schemas/ref.md
[StringDataSchema]: https://github.com/guanghechen/barusu/blob/master/packages/configuration-master/doc/schemas/string.md

[DataHandleResult]: https://github.com/guanghechen/barusu/blob/master/packages/configuration-master/src/_util/handle-result.ts
[schema]: https://github.com/guanghechen/barusu/blob/master/packages/configuration-master/doc/schema.md
[DataSchemaCompiler]: https://github.com/guanghechen/barusu/blob/master/packages/configuration-master/doc/compiler.md
[DataValidator]: https://github.com/guanghechen/barusu/blob/master/packages/configuration-master/doc/validator.md
