import { configurationMaster } from '../../src'


const rawSchema = {
  type: 'array',
  items: {
    "type": "integer"
  },
  unique: true,
  required: true,
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
validate([1, 2])      // [1, 2];
validate([1, 1, 2])   // undefined; and will print errors (`unique` is not satisfied)
validate({})          // undefined; and will print errors (`type` is not satisfied)
validate('apple')     // undefined; and will print errors (`type` is not satisfied)
