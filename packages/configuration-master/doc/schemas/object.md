# ObjectSchema
  * [rawSchema][]
    ```typescript
    interface RawObjectDataSchema {
      type: 'object'
      required?: boolean
      default?: boolean
      properties?: { [key: string]: RawDataSchema }
      patternProperties?: { [pattern: string]: RawDataSchema } | { pattern: string, schema: RawDataSchema }[]
      allowAdditionalProperties?: boolean
      propertyNames?: RawStringDataSchema
      dependencies?: { [key: string]: string[] }
      silentIgnore?: boolean
      requiredProperties?: string[]
    }
    ```

  * [schema][]
    ```typescript
    interface ObjectDataSchema {
      type: 'object'
      required: boolean
      requiredProperties: string[]
      default?: boolean
      properties?: { [key: string]: DataSchema }
      patternProperties?: { pattern: RegExp, schema: DSchema }[]
      allowAdditionalProperties: boolean
      propertyNames?: StringDataSchema
      dependencies?: { [key: string]: string[] }
      silentIgnore: boolean
    }
    ```

  * properties:

     property                     | description                       | default | required
    :-----------------------------|:----------------------------------|:--------|:---------------------------------------
     `type`                       | the type of DataSchema            | -       | Yes (and the value must be `'object'`)
     `required`                   | whether the data must be set      | `false` | No
     `default`                    | default value of this DataSchema  | -       | No
     `properties`                 | see [properties][]                | -       | No
     `patternProperties`          | see [patternProperties][]         | -       | No
     `allowAdditionalProperties`  | see [allowAdditionalProperties][] | `false` | No
     `propertyNames`              | see [propertyNames][]             | -       | No
     `dependencies`               | see [dependencies][]              | -       | No
     `silentIgnore`               | see [silentIgnore][]              | `false` | No
     `requiredProperties`         | see [requiredProperties][]        | `[]`    | No

  ## properties
  * 定义对象中各个属性的数据模式

  ---

  * The value of `properties` is an object, where each key is the name of a property and each value is a DataSchema used to validate that property

  * reference the [json-schema: object#properties](https://json-schema.org/understanding-json-schema/reference/object.html#properties)

  ## patternProperties
  * 对象属性的类型，和 properties 类似，但是名称为正则表达式

  ---
  * It's similar to [properties][], but the `name` is a regular expression which can match multiple propertyNames


  ## allowAdditionalProperties

  * 是否允许其它额外的属性；若为 `false`：
    - 若指定了 `properties`，则对象中只有 `properties` 中出现的属性会被采用，其它的属性将被忽略
    - 否则，所有属性都将被忽略
  * 若为 `true`：
    - 若指定了 `propertyNames`，则对象中只有 `properties` 中出现的属性和属性名匹配 `propertyNames` 属性会被采用；
    - 否则，除 `properties` 中定义的属性外，其它属性也不会被忽略，且相当于其类型为 `any`

  ---

  * Whether other additional attributes are allowed; if `false`:
    - If `properties` is specified, only the attributes that appear in `properties` will be used in the validation result, and other attributes will be ignored.
    - Otherwise, all attributes will be ignored
  * If `true`:
    - If `propertyNames` is specified, only the attributes appear in `properties` or attribute names that matched the schema defined by `propertyNames`.
    - Otherwise, except for the properties defined in `properties`, other properties are not ignored, and their type is `any`


  ## propertyNames
  * 对象属性名的数据类型；该值无需配合 `allowAdditionalProperties`，其定义了除 `properties` 中定义的属性外，其它属性的属性名应该满足的数据模式；若不满足此数据模式，则该属性将在校验结果中被忽略

  ---

  * The data schema of the object property name; this value does not need to work with `allowAdditionalProperties`, which defines the data schema that the property names of other properties should satisfy except for the properties defined in `properties`; if this data schema is not met, the property Will be ignored in the validation result

  * reference the [json-schema: object#property-names](https://json-schema.org/understanding-json-schema/reference/object.html#property-names)


  ## dependencies
  * `dependencies` 的值是一个对象。对象中的每个条目 `{ p: [...] }` 表示 `p` 的依赖项，即若 `p` 出现在对象中，则此数组内的所有属性也都必须出现。

  ---

  The value of the `dependencies` keyword is an object. Each entry in the object maps from the name of a property `p`, to an array of strings listing properties that are required whenever `p` is present.

  * reference the [json-schema: object#dependencies](https://json-schema.org/understanding-json-schema/reference/object.html#dependencies)

  ## silentIgnore
  * 若为 `false`，当 `allowAdditionalProperties` 为 `true` 且出现既未在 `properties` 中定义也不匹配 `propertyNames` 属性时，会在校验结果中添加一条警告信息，并忽略此属性
  * 否则，当 `allowAdditionalProperties` 为 `true` 且出现既未在 `properties` 中定义也不匹配 `propertyNames` 属性时，会直接忽略此属性

  ---

  * If `false`, when `allowAdditionalProperties` is `true` and it appears neither in `properties` nor matched the `propertyNames` schema, a warning message will be added to the validation result and this property will be ignored.
  * Otherwise, this property is ignored directly when `allowAdditionalProperties` is `true` and appears neither in `properties` nor matched the `propertyNames` schema.

  ## requiredProperties
  * 指定必须存在的属性，若属性自身（`properties` 中）设置了 `required`，可以覆盖此值
    但若是在 `propertyName` 中设置了 `required`，无法覆盖此值，因为 `propertyNames` 定义
    的是属性名的规则，在编译阶段无法使用它进行校验

  * 和 JSON-Schema 中定义的 [required](https://json-schema.org/understanding-json-schema/reference/object.html#required-properties) 类似

  ---

  * Specify properties which must be exist. If the value of the `required` property is set in the property itself (in `properties`),
    this value can be overridden. However, if the value of the `required` is set in `propertyNames`, this value cannot be
    overridden because `propertyNames` defines the rule for attribute names, which cannot be verified during compilation

  * Similar to [required](https://json-schema.org/understanding-json-schema/reference/object.html#required-properties) defined in JSON-Schema


# demo

  ```typescript
  import { configurationMaster } from '@barusu/configuration-master'

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
      age: {
        type: 'integer',
        minimum: 1,
      },
    },
    patternProperties: {
      '^data(?:\\-[\\w]+)+$': {
        type: 'string',
      },
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
    console.log('value:', JSON.stringify(result.value, null, 2))
    return result.value
  }

  validate(undefined)                                                               // undefined; and will print errors (`required` is not satisfied)
  validate({ name: 'alice', age: 20, 'data-gender': 'male', })                      // { name: 'alice', age: 20, 'data-gender': 'male', };
  validate({ name: 'bob', gender: 'male' })                                         // { name: 'bob', gender: 'male' }
  validate({ name: 'joy', age: 33, more: 'something', sex: 'female' })              // { name: 'joy', age: 33, sex: 'female' }
  validate({ name: 'joy', email: 'joy@bob.com', more: 'something', sex: 'female' }) // undefined; and will print errors (`dependencies#email` is not satisfied)
  validate({ name: 'joy', email: 'joy@bob.com', age: 33, gender: 'female' })        // { name: 'joy', email: 'joy@bob.com', age: 33, gender: 'female' }
  validate({ name: 'joy', age: 33, 'data-gender': 1 })                              // undefined; and will print errors (`regexProperties#data-gender` is not a valid string)
  validate(false)                                                                   // undefined; and will print errors (`type` is not satisfied)
  ```

* also see:
  - [demo][]
  - [test cases][test-cases]


[rawSchema]: ../../src/schema/object.ts#RawObjectDataSchema
[schema]: ../../src/schema/object.ts#ObjectDataSchema
[demo]: ../../demo/object
[test-cases]: ../../test/cases/data-schema/base-schema/object

[properties]: #properties
[patternProperties]: #patternProperties
[allowAdditionalProperties]: #allowAdditionalProperties
[propertyNames]: #propertyNames
[dependencies]: #dependencies
[silentIgnore]: #silentIgnore
[requiredProperties]: #requiredProperties
