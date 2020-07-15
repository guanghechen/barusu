import { configurationMaster } from '../../src'


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
