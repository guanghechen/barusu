import { configurationMaster } from '../../src'


const rawSchema = {
  type: 'number',
  exclusiveMinimum: -23,
  maximum: 23,
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
validate(1)           // 1;
validate('0xf')       // 15;
validate(-22.99999)   // -22.99999;
validate(-23)         // undefined; and will print errors (`exclusiveMinimum` is not satisfied)
validate(23)          // 23
validate(24)          // undefined; and will print errors (`maximum` is not satisfied)
validate([])          // undefined; and will print errors (`type` is not satisfied)
