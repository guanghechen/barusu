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
