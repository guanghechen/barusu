import { configurationMaster } from '../../src'


const rawSchema = {
  type: 'string',
  minLength: 10,
  maxLength: 25,
  pattern: '^[^@]+@[^\\.]+\\..+$',
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

validate(undefined)                             // undefined; and will print errors (`required` is not satisfied)
validate('alice@gmail.com')                     // alice@gmail.com;
validate('alice.gmail.com')                     // undefined; and will print errors (`pattern` is not satisfied)
validate('a@ss.com')                            // undefined; and will print errors (`minLength` is not satisfied)
validate('apple_banana_cat_dog@something.com')  // undefined; and will print errors (`maxLength` is not satisfied)
validate([])                                    // undefined; and will print errors (`type` is not satisfied)
