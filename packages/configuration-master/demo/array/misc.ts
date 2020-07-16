import { configurationMaster } from '../../src'


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
