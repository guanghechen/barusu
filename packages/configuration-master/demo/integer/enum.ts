import { configurationMaster } from '../../src'


const rawSchema = {
  type: 'integer',
  enum: [1, 2, 4, 8, 16],
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
validate(1)           // 1;
validate(23)          // undefined; and will print errors (`enum` is not satisfied)
validate(16)          // 16;
validate([])          // undefined; and will print errors (`type` is not satisfied)
