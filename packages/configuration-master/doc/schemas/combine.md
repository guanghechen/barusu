# CombineSchema
  * [rawSchema][]
    ```typescript
    interface RawCombineDataSchema {
      type: 'combine'
      required?: boolean
      default?: boolean
      strategy?: 'all' | 'any' | 'one'
      allOf?: RawDataSchema[]
      anyOf?: RawDataSchema[]
      oneOf?: RawDataSchema[]
    }
    ```

  * [schema][]
    ```typescript
    interface CombineDataSchema {
      type: 'combine'
      required: boolean
      default?: boolean
      strategy: 'all' | 'any' | 'one'
      allOf?: DataSchema[]
      anyOf?: DataSchema[]
      oneOf?: DataSchema[]
    }
    ```

  * properties:

     property   | description                       | default | required
    :-----------|:----------------------------------|:--------|:---------------------------------------
     `type`     | the type of DataSchema            | -       | Yes (and the value must be `'combine'`)
     `required` | whether the data must be set      | `false` | No
     `default`  | default value of this DataSchema  | -       | No
     `strategy` | see [strategy][]                  | `"all"` | No
     `allOf`    | see [allOf][]                     | -       | No
     `anyOf`    | see [anyOf][]                     | -       | No
     `oneOf`    | see [oneOf][]                     | -       | No


  ## strategy
  * 组合模式策略，当 [allOf][], [anyOf][], [oneOf][] 这三项中有多项被指定时的模式策略：
    - `all`: 指定的多项组合类型数据模式需全部满足，才算校验通过
    - `any`: 指定的多项组合类型数据模式中，满足任意模式就算校验通过
    - `one`: 指定的多项组合类型数据模式中，满足且仅满足一种模式才算校验通过

  ---

  * Combination mode strategy, when [allOf][], [anyOf][], [oneOf][] these three modes are specified:
    - `all`: The specified multiple combination type data schema needs to be fully satisfied.
    - `any`: The specified multiple combination type data schema, if any schema is satisfied, the verification is passed.
    - `one`: The specified multiple combination type data schema is satisfied and only one schema is satisfied.

  ## allOf
  * 需要满足所有 `allOf` 中定义的 DataSchema 才算校验通过

  ---

  * Need to meet all the DataSchema defined in `allOf` to pass the validation
  * reference: [json-schema: combining#allOf](https://json-schema.org/understanding-json-schema/reference/combining.html#allof)

  ## anyOf
  * 满足任意一项 `anyOf` 中定义的 DataSchema 就算校验通过

  ---

  * meet any of the DataSchema defined in `anyOf` to pass the validation
  * reference: [json-schema: combining#anyOf](https://json-schema.org/understanding-json-schema/reference/combining.html#anyof)


  ## oneOf
  * 满足且仅满足 `oneOf` 中定义的某个 DataSchema 才算校验通过

  ---
  * meet and only meets one of the DataSchema defined in `oneOf` to pass the validation
  * reference: [json-schema: combining#oneOf](https://json-schema.org/understanding-json-schema/reference/combining.html#oneof)


# demo

  ```typescript
  import { configurationMaster } from '@barusu/configuration-master'

  const rawSchema = {
    type: 'combine',
    strategy: 'one',
    required: true,
    allOf: [
      {
        type: 'object',
        allowAdditionalProperties: true,
        silentIgnore: true,
        properties: {
          nickname: {
            type: 'string',
            required: true
          }
        }
      },
      {
        type: 'object',
        allowAdditionalProperties: true,
        silentIgnore: true,
        properties: {
          age: {
            type: 'integer',
            minimum: 1,
            required: true
          }
        }
      }
    ],
    anyOf: [
      {
        type: 'string',
        minLength: 3,
        maxLength: 25,
        required: true
      },
      {
        type: 'object',
        silentIgnore: true,
        properties: {
          name: {
            type: 'string',
            required: true
          }
        }
      }
    ]
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

  validate(undefined)                       // undefined; and will print errors (`required` is not satisfied)
  validate({ nickname: 'alice', age: 22 })  // { nickname: 'alice', age: 22 };
  validate('alice')                         // 'alice';
  validate({ name: 'alice' })               // { name: 'alice' };
  validate(true)                            // undefined; and will print errors (`strategy` is not satisfied: `allOf` and `anyOf` both are not satisfied)
  validate({ nickname: 'alice' })           // undefined; and will print errors (`strategy` is not satisfied: `allOf` and `anyOf` both are not satisfied)
  validate({                                // undefined; and will print errors (`strategy` is not satisfied: `allOf` and `anyOf` both are satisfied)
    nickname: 'alice',
    age: 22,
    name: 'alice'
  })
  ```

* also see:
  - [demo][]
  - [test cases][test-cases]


[rawSchema]: ../../src/schema/combine.ts#RawCombineDataSchema
[schema]: ../../src/schema/combine.ts#CombineDataSchema
[demo]: ../../demo/combine
[test-cases]: ../../test/cases/data-schema/combine-schema

[strategy]: #strategy
[allOf]: #allOf
[anyOf]: #anyOf
[oneOf]: #oneOf
