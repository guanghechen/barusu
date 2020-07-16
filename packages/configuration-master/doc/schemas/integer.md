# IntegerSchema
  * [rawSchema][]
    ```typescript
    interface RawIntegerDataSchema {
      type: 'integer'
      required?: boolean
      default?: boolean
      minimum?: number
      maximum?: number
      exclusiveMinimum?: number
      exclusiveMaximum?: number
      enum?: number[]
    }
    ```

  * [schema][]
    ```typescript
    interface IntegerDataSchema {
      type: 'integer'
      required: boolean
      default?: boolean
      minimum?: number
      maximum?: number
      exclusiveMinimum?: number
      exclusiveMaximum?: number
      enum?: number[]
    }
    ```

  * properties:

     property           | description                       | default | required
    :-------------------|:----------------------------------|:--------|:---------------------------------------
     `type`             | the type of DataSchema            | -       | Yes (and the value must be `'integer'`)
     `required`         | whether the data must be set      | `false` | No
     `default`          | default value of this DataSchema  | -       | No
     `minimum`          | minimum value ($x \geqslant$)     | -       | No
     `maximum`          | maximum value ($x \leqslant$)     | -       | No
     `exclusiveMinimum` | exclusive minimum value ($x >$)   | -       | No
     `exclusiveMaximum` | exclusive maximum value ($x <$)   | -       | No
     `enum`             | acceptable values ($x \in$)       | -       | No


# demo

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
    console.log('value:', JSON.stringify(result.value, null, 2))
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

* also see:
  - [demo][]
  - [test cases][test-cases]


[rawSchema]: ../../src/schema/integer.ts#RawIntegerDataSchema
[schema]: ../../src/schema/integer.ts#IntegerDataSchema
[demo]: ../../demo/integer
[test-cases]: ../../test/cases/data-schema/base-schema/integer
