# RefSchema
  * [rawSchema][]
    ```typescript
    interface RawRefDataSchema {
      type: 'ref'
      $ref: string
      required?: boolean
      default?: boolean
    }
    ```

  * [schema][]
    ```typescript
    interface NumberDataSchema {
      type: 'ref'
      $ref: string
      required: boolean
      default?: boolean
    }
    ```

  * properties:

     property           | description                           | default | required
    :-------------------|:--------------------------------------|:--------|:---------------------------------------
     `type`             | the type of DataSchema                | -       | Yes (and the value must be `'number'`)
     `required`         | whether the data must be set          | `false` | No
     `default`          | default value of this DataSchema      | -       | No
     `$ref`             | the $id of the referenced DataSchema  | -       | No


# demo

  ```typescript
  import { configurationMaster } from '@barusu/configuration-master'

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
    }
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

* also see:
  - [demo][]
  - [test cases][test-cases]


[rawSchema]: ../../src/schema/ref.ts#RawNumberDataSchema
[schema]: ../../src/schema/ref.ts#NumberDataSchema
[demo]: ../../demo/ref
[test-cases]: ../../test/cases/data-schema/base-schema/ref
