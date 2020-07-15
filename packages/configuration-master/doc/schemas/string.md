# StringSchema
  * [rawSchema][]
    ```typescript
    enum StringFormat {
      IPV4 = 'ipv4',
      IPV6 = 'ipv6',
      EMAIL = 'email',
      DATE = 'date',
      TIME = 'time',
      DATE_TIME = 'date-time',
    }

    interface RawStringDataSchema {
      type: 'string'
      required?: boolean
      default?: boolean
      minLength?: number
      maxLength?: number
      pattern?: string
      format?: StringFormat | StringFormat[]
      enum?: string[]
    }
    ```

  * [schema][]
    ```typescript
    interface StringDataSchema {
      type: 'string'
      required: boolean
      default?: boolean
      minLength?: number
      maxLength?: number
      pattern?: string
      format?: StringFormat[]
      enum?: string[]
    }
    ```

  * properties:

     property           | description                               | default | required
    :-------------------|:------------------------------------------|:--------|:---------------------------------------
     `type`             | the type of DataSchema                    | -       | Yes (and the value must be `'string'`)
     `required`         | whether the data must be set              | `false` | No
     `default`          | default value of this DataSchema          | -       | No
     `minLength`        | minimum length ($x.length \geqslant$)     | -       | No
     `maxLength`        | maximum length ($x.length \leqslant$)     | -       | No
     `pattern`          | a regular expression defined data pattern | -       | No
     `format`           | see [format][]                            | -       | No
     `transform`        | see [transform][]                         | -       | No
     `enum`             | acceptable values ($x \in$)               | -       | No

## format

  * 指定字符串的类型，和 `StringDataSchema` 中其它属性按照“与”逻辑进行校验
  * 若指定了多个，则表示“或”的关系，如 { format: ['ipv4', 'ipv6' ] } 表示既可为 ipv4 地址也可为 ipv6 地址，现在支持的有：
    - `ipv4`:
    - `ipv6`:
    - `email`:
    - `date`: `YYYY-MM-DD`
    - `time`: `HH:mm:ssZ / HH:mm:ss.SZ / HH:mm:ss+HH:mm / HH:mm:ss.S+HH:mm`
    - `date-time`: `<date>T<time>`

  ---

  * Specify the format of the string.
  * If more than one format is specified, any of these formats matched is ok, such as `{ format: ['ipv4', 'ipv6' ] }` means that it can be either an `ipv4` address or an `ipv6` address., now supported are:
    - `ipv4`:
    - `ipv6`:
    - `email`:
    - `date`: `YYYY-MM-DD`
    - `time`: `HH:mm:ssZ / HH:mm:ss.SZ / HH:mm:ss+HH:mm / HH:mm:ss.S+HH:mm`
    - `date-time`: `<date>T<time>`

## transform
  * Specify The conversion function for string, now supported:
    - `trim`: 去除头尾空白字符
    - `lower-case`: 转成小写
      ```typescript
      toLowerCase('TEST STRING') // => "test string"
      ```
    - `upper-case`: 转成大写
      ```typescript
      toUpperCase('test string') // => "TEST STRING"
      ```
    - `capital-case`: 转成首字母大写
      ```typescript
      toCapitalCase('test string') // => "Test String"
      ```
    - `camel-case`: 驼峰式（首字母小写）
      ```typescript
      toCameCase('test string') // => "testString"
      ```
    - `pascal-case`: 驼峰式（首字母大写）
      ```typescript
      toPascalCase('test string') // => "TestString"
      ```
    - `kebab-case`: 小写串式
      ```typescript
      toKebabCase('test string') // => "test-string"
      ```
    - `snake-case`: 小写下划线连接式
      ```typescript
      toSnakeCase('test string') // => "test_string"
      ```
    - `constant-case`: 大写下划线连接式
      ```typescript
      toConstantCase('test string') // => "TEST_STRING"
      ```

# demo

## demo1

  ```typescript
  import { configurationMaster } from '@barusu/configuration-master'

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
  ```

## demo2
  ```typescript
  import { configurationMaster } from '@barusu/configuration-master'

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
  ```

## more
  * also see:
    - [demo][]
    - [test cases][test-cases]


[rawSchema]: ../../src/schema/string.ts#RawStringDataSchema
[schema]: ../../src/schema/string.ts#StringDataSchema
[demo]: ../../demo/string
[test-cases]: ../../test/cases/data-schema/base-schema/string
