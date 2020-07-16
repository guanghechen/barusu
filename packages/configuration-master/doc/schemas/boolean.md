# BooleanSchema
  * [rawSchema][]
    ```typescript
    interface RawBooleanDataSchema {
      type: 'boolean'
      required?: boolean
      default?: boolean
    }
    ```

  * [schema][]
    ```typescript
    interface BooleanDataSchema {
      type: 'boolean'
      required: boolean
      default?: boolean
    }
    ```

  * properties:

     property   | description                       | default | required
    :-----------|:----------------------------------|:--------|:---------------------------------------
     `type`     | the type of DataSchema            | -       | Yes (and the value must be `'boolean'`)
     `required` | whether the data must be set      | `false` | No
     `default`  | default value of this DataSchema  | -       | No


# demo

  ```typescript
  import { configurationMaster } from '@barusu/configuration-master'

  const rawSchema = {
    type: 'boolean',
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

  validate(undefined)   // undefined; and will print errors (`required` is not satisfied)
  validate(false)       // false;
  validate(true)        // true;
  validate([])          // undefined; and will print errors (`type` is not satisfied)
  ```

* also see:
  - [demo][]
  - [test cases][test-cases]


[rawSchema]: ../../src/schema/boolean.ts#RawBooleanDataSchema
[schema]: ../../src/schema/boolean.ts#BooleanDataSchema
[demo]: ../../demo/boolean
[test-cases]: ../../test/cases/data-schema/base-schema/boolean
