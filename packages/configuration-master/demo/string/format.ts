import { configurationMaster } from '../../src'


const rawSchema = {
  type: 'string',
  format: ['ipv4', 'ipv6'],
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
validate('1::')                 // '1::';
validate('1::8')                // '1::8';
validate('1::7:8')              // '1::7:8';
validate('1.2.3.4')             // '1.2.3.4';
validate('127.0.0.1')           // '127.0.0.1';
validate('1:2:3:4:5:6:7:8:9')   // undefined; and will print errors (`format` is not satisfied: neither ipv4 nor ipv6)
validate('127.1')               // undefined; and will print errors (`format` is not satisfied: neither ipv4 nor ipv6)
validate('192.168.1.256')       // undefined; and will print errors (`format` is not satisfied: neither ipv4 nor ipv6)
