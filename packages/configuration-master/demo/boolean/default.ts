import { configurationMaster } from '../../src'


const rawSchema = {
  type: 'boolean',
  default: true
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

validate(undefined)   // true;
validate(false)       // false;
validate(true)        // true;
validate([])          // undefined; and will print errors (`type` is not satisfied)
