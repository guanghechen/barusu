# Introduction

* DataValidator 的作用是校验给定的数据是否匹配指定的 DataSchema，并对数据做适当的处理

---

* The role of the DataValidator is to verify that the given data matches the specified DataSchema and handle the data appropriately.

* Already implemented Data validators:

  - array：[ArrayDataValidator](../src/validator/array.ts)
  - boolean：[BooleanDataValidator](../src/validator/boolean.ts)
  - combine：[CombineDataValidator](../src/validator/combine.ts)
  - integer：[IntegerDataValidator](../src/validator/integer.ts)
  - null：[NullDataValidator](../src/validator/null.ts)
  - number：[NumberDataValidator](../src/validator/number.ts)
  - object：[ObjectDataValidator](../src/validator/object.ts)
  - ref：[RefDataValidator](../src/validator/ref.ts)
  - string：[StringDataValidator](../src/validator/string.ts)

## DataValidationResult

  // todo: provide documents about DataValidationResult

## ValidatorMaster
  * ValidatorMaster 管理类型和校验器的映射关系，可以认为是校验器的注册中心，`@barusu/configuration-master` 提供了默认的 ValidatorMaster 实例，可通过 `import { validatorMaster } from '@barusu/configuration-master'` 引入

  * `@barusu/configuration-master` 提供了一些基础的校验器，默认的 ValidatorMaster 实例已注册了这些基础校验器；因此如果要手动创建实例，建议注册包中提供的校验器

  ---

  * ValidatorMaster manages the mapping between types and validators and can be thought of as the registry of DataValidator. `@barusu/configuration-master` provides the default ValidatorMaster instance, which can be used across `import { validatorMaster } from '@barusu/configuration-master'`

  * `@barusu/configuration-master` provides some basic validators, which are registered by the default ValidatorMaster instance; therefore, if you want to create an instance manually, it is recommended to register the validators provided from `@barusu/configuration-master`. For example:

    ```typescript
    import {
      ARRAY_T_TYPE,
      BOOLEAN_T_TYPE,
      COMBINE_T_TYPE,
      INTEGER_T_TYPE,
      NULL_T_TYPE,
      NUMBER_T_TYPE,
      OBJECT_T_TYPE,
      REF_T_TYPE,
      STRING_T_TYPE,
      ArrayDataValidatorFactory,
      BooleanDataValidatorFactory,
      CombineDataValidatorFactory,
      IntegerDataValidatorFactory,
      NullDataValidatorFactory,
      NumberDataValidatorFactory,
      ObjectDataValidatorFactory,
      RefDataValidatorFactory,
      StringDataValidatorFactory,
      DataValidatorMaster,
    } from '@barusu/configuration-master'

    // create ValidatorMaster manually
    export const validatorMaster = new DataValidatorMaster()
    validatorMaster.registerValidatorFactory(ARRAY_T_TYPE, new ArrayDataValidatorFactory(validatorMaster))
    validatorMaster.registerValidatorFactory(BOOLEAN_T_TYPE, new BooleanDataValidatorFactory(validatorMaster))
    validatorMaster.registerValidatorFactory(COMBINE_T_TYPE, new CombineDataValidatorFactory(validatorMaster))
    validatorMaster.registerValidatorFactory(INTEGER_T_TYPE, new IntegerDataValidatorFactory(validatorMaster))
    validatorMaster.registerValidatorFactory(NULL_T_TYPE, new NullDataValidatorFactory(validatorMaster))
    validatorMaster.registerValidatorFactory(NUMBER_T_TYPE, new NumberDataValidatorFactory(validatorMaster))
    validatorMaster.registerValidatorFactory(OBJECT_T_TYPE, new ObjectDataValidatorFactory(validatorMaster))
    validatorMaster.registerValidatorFactory(REF_T_TYPE, new RefDataValidatorFactory(validatorMaster))
    validatorMaster.registerValidatorFactory(STRING_T_TYPE, new StringDataValidatorFactory(validatorMaster)
    ```

# Create new data schema validator
  * create XDataSchema type:
    ```typescript
    import { DataSchema } from '@barusu/configuration-master'

    const T = 'ipv4'
    type T = typeof T
    type V = string
    type DS = DataSchema<T, V>
    ```

  * create XDataValidationResult type:
    ```typescript
    import { DataValidationResult } from '@barusu/configuration-master'
    export type Ipv4DataValidationResult = DataValidationResult<T, V, DS>
    ```

  * create XDataValidator:
    ```typescript
    import { BaseDataValidator, DataValidatorContext } from '@barusu/configuration-master'
    export class Ipv4DataValidator extends BaseDataValidator<T, V, DS> {
      private readonly pattern: RegExp
      public readonly type: T = T

      public constructor (schema: DS, context: DataValidatorContext) {
        super(schema, context)
        this.pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
      }

      public validate (data: any): Ipv4DataValidationResult {
        const result: Ipv4DataValidationResult = super.validate(data)
        data = result.value
        result.setValue(undefined)

        // if data is null/undefined, no further verification required
        if (data == null) return result

        // check pattern
        const value = coverString(this.schema.default, data).value
        if (!this.pattern.test(value)) {
          return result.addError({
            constraint: 'type',
            reason: `value is not a valid ipv4 value. expected pattern is ${ this.pattern.source }`
          })
        }

        // passed validation
        return result.setValue(value)
      }
    }
    ```

  * create XDataValidatorFactory
    ```typescript
    export class Ipv4DataValidatorFactory extends BaseDataValidatorFactory<T, V, DS> {
      public readonly type: T = T

      public create(schema: DS) {
        return new Ipv4DataValidator(schema, this.context)
      }
    }
    ```

  * register to `validatorMaster`:
    ```typescript
    import { DataValidatorMaster } from '@barusu/configuration-master'
    const validatorMaster = new DataValidatorMaster()
    validatorMaster.registerValidatorFactory(T, new Ipv4DataValidatorFactory(validatorMaster))
    ```

    or register to `configurationMaster` (you also can create new instance of ConfigurationMaster)
    ```typescript
    import { configurationMaster } from '@barusu/configuration-master'
    configurationMaster.registerValidatorFactory(T, Ipv4DataValidatorFactory)
    ```

  * full code

    ```typescript
    import {
      DataSchema, DataValidationResult,
      BaseDataValidator, BaseDataValidatorFactory,
      DataValidatorContext, coverBoolean, coverString, configurationMaster,
    } from '@barusu/configuration-master'

    const T = 'ipv4'
    type T = typeof T
    type V = string
    type DS = DataSchema<T, V>

    /**
     * result type of Ipv4DataSchemaValidator.validate
     */
    export type Ipv4DataValidationResult = DataValidationResult<T, V, DS>

    /**
     * ipv4 validator
     */
    export class Ipv4DataValidator extends BaseDataValidator<T, V, DS> {
      private readonly pattern: RegExp
      public readonly type: T = T

      public constructor (schema: DS, context: DataValidatorContext) {
        super(schema, context)
        this.pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
      }

      public validate (data: any): Ipv4DataValidationResult {
        const result: Ipv4DataValidationResult = super.validate(data)
        data = result.value
        result.setValue(undefined)

        // if data is null/undefined, no further verification required
        if (data == null) return result

        // check if data is string
        const value = result.validateType(coverString, data)!
        if (result.hasError) return result

        // check pattern
        if (!this.pattern.test(value)) {
          return result.addError({
            constraint: 'type',
            reason: `value is not a valid ipv4 value. expected pattern is ${ this.pattern.source }`
          })
        }

        // passed validation
        return result.setValue(value)
      }
    }

    /**
     * Ipv4 validator factory
     */
    export class Ipv4DataValidatorFactory extends BaseDataValidatorFactory<T, V, DS> {
      public readonly type: T = T

      public create(schema: DS) {
        return new Ipv4DataValidator(schema, this.context)
      }
    }

    // register validator
    configurationMaster.registerValidatorFactory(T, Ipv4DataValidatorFactory)
    ```

  * see [demo/custom-type/ipv4.ts](../demo/custom-type/ipv4.ts)
