import { configurationMaster } from '../../src'


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
