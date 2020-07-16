# ArraySchema
  * [rawSchema][]
    ```typescript
    interface RawArrayDataSchema {
      type: 'array'
      required?: boolean
      default?: boolean
      items: RawDataSchema
      unique?: boolean
    }
    ```

  * [schema][]
    ```typescript
    interface ArrayDataSchema {
      type: 'array'
      required: boolean
      default?: boolean
      items: DataSchema
      unique: boolean
    }
    ```

  * properties:

     property   | description                               | default | required
    :-----------|:------------------------------------------|:--------|:---------------------------------------
     `type`     | the type of DataSchema                    | -       | Yes (and the value must be `'array'`)
     `required` | whether the data must be set              | `false` | No
     `default`  | default value of this DataSchema          | -       | No
     `items`    | element's DataSchema the of array         | -       | Yes
     `unique`   | should element of an array ensure unique  | `false` | No


# demo

  ```typescript
  import { configurationMaster } from '@barusu/configuration-master'

  const rawSchema = {
    type: 'array',
    items: {
      type: 'object',
      allowAdditionalProperties: true,
      propertyNames: {
        type: 'string',
        pattern: '^data-'
      },
      properties: {
        host: {
          type: 'string',
          pattern: '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$',
          default: '127.0.0.1'
        },
        port: {
          type: 'integer',
          minimum: 0,
          maximum: 65535,
          required: true
        }
      }
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

  // undefined; and will print errors (`required` is not satisfied)
  validate(undefined)

  //  [{ host: '127.0.0.2', port: 80 }, { port: 3000, 'data-host': '127.0.0.1', host: '127.0.0.1' }]
  validate([{ host: '127.0.0.2', port: 80 }, { port: 3000, 'data-host': '127.0.0.1' }])

  // undefined; and will print errors (`[0]:type` and `[1]:type` are not satisfied)
  validate([1, 'a2'])

  // undefined; and will print errors (`[0].port:maximum` and `[1].host:pattern` are not satisfied)
  validate([ { "port": 3000000, "host": "1270.0.0.1" }])
  ```

* also see:
  - [demo][]
  - [test cases][test-cases]


[rawSchema]: ../../src/schema/array.ts#RawArrayDataSchema
[schema]: ../../src/schema/array.ts#ArrayDataSchema
[demo]: ../../demo/array
[test-cases]: ../../test/cases/data-schema/base-schema/array
