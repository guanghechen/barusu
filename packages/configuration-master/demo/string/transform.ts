import { configurationMaster } from '../../src'


const rawSchema = {
  type: 'string',
  transform: ['trim', 'lowercase'],
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

validate(undefined)             // undefined; and will print errors (`required` is not satisfied)
validate(' Apple ')             // apple
validate('   Cat  Dog')         // cat  dog
