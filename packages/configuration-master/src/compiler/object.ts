import { isArray, isObject } from '@barusu/util-option'
import {
  BaseDataSchemaCompiler,
  DataSchemaCompileResult,
  DataSchemaCompiler,
} from '../_core/compiler'
import { DSchema, RDSchema } from '../_core/schema'
import { coverArray, coverBoolean, coverString } from '../_util/cover-util'
import { stringify } from '../_util/string-util'
import {
  OBJECT_T_TYPE as T,
  OBJECT_V_TYPE as V,
  ObjectDataSchema,
  ObjectDataSchema as DS,
  RawObjectDataSchema as RDS,
} from '../schema/object'
import { STRING_T_TYPE, StringDataSchema } from '../schema/string'

/**
 * ObjectDataSchema 编译结果的数据类型
 */
export type ObjectDataSchemaCompileResult = DataSchemaCompileResult<
  T,
  V,
  RDS,
  DS
>

/**
 * 对象类型的模式的编译器
 *
 * enum 将忽略所有非对象的值
 */
export class ObjectDataSchemaCompiler
  extends BaseDataSchemaCompiler<T, V, RDS, DS>
  implements DataSchemaCompiler<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * compile RawSchema to Schema
   * @param rawSchema
   */
  public compile(rawSchema: RDS): ObjectDataSchemaCompileResult {
    const result: ObjectDataSchemaCompileResult = super.compile(rawSchema)
    // eslint-disable-next-line no-param-reassign
    rawSchema = result._rawSchema

    // silentIgnore 的默认值为 false
    const silentIgnoreResult = result.compileConstraint<boolean>(
      'silentIgnore',
      coverBoolean,
      false,
    )

    // 校验属性是否为对象
    const ensureObject = (constraintName: keyof RDS) => {
      if (!isObject(rawSchema[constraintName])) {
        result.addError({
          constraint: constraintName as string,
          reason: `${constraintName} must be an object, but got (${stringify(
            rawSchema[constraintName],
          )}).`,
        })
        return false
      }
      return true
    }

    // 检查 defaultValue 是否为对象
    let defaultValue: ObjectDataSchema['default'] = undefined
    if (rawSchema.default != null) {
      if (ensureObject('default')) {
        defaultValue = rawSchema.default
      }
    }

    // requiredProperties
    const { value: requiredProperties = [] } = result.compileConstraint<
      string[]
    >('requiredProperties', coverArray<string>(coverString))

    // 编译 properties
    let properties: ObjectDataSchema['properties'] = undefined
    if (rawSchema.properties != null) {
      if (ensureObject('properties')) {
        properties = {}
        for (const propertyName of Object.getOwnPropertyNames(
          rawSchema.properties,
        )) {
          let { ...propertyValueSchema } = rawSchema.properties[propertyName]

          // 如果属性在 requiredProperties 中定义了，则其 required 默认值为 true
          const requiredIndex = requiredProperties.indexOf(propertyName)
          if (requiredIndex >= 0) {
            propertyValueSchema = {
              required: true,
              ...propertyValueSchema,
            }
          }
          const propertyCompileResult = this.context.compileDataSchema(
            propertyValueSchema,
          )
          result.addHandleResult(
            'properties',
            propertyCompileResult,
            propertyName,
          )

          // 如果存在错误，则忽略此属性
          if (propertyCompileResult.hasError) continue

          // 检查该属性是否 required
          // 若是，则将其添加进 requiredProperties 中
          // 否则，则将其从 requiredProperties 中移除
          const propertySchema = propertyCompileResult.value!
          if (requiredIndex < 0 && propertySchema.required) {
            requiredProperties.push(propertyName)
          } else if (requiredIndex >= 0 && !propertySchema.required) {
            requiredProperties.splice(requiredIndex, 1)
          }
          properties[propertyName] = propertyCompileResult.value!
        }

        // 如果没有有效值，则置为 undefined
        if (Object.getOwnPropertyNames(properties).length <= 0)
          properties = undefined
      }
    }

    // 编译 patternProperties
    let patternProperties: ObjectDataSchema['patternProperties'] = undefined
    if (rawSchema.patternProperties != null) {
      let rawPatternProperties:
        | { pattern: string; schema: RDSchema }[]
        | undefined
      if (isArray(rawSchema.patternProperties)) {
        rawPatternProperties = rawSchema.patternProperties
      } else if (ensureObject('patternProperties')) {
        rawPatternProperties = Object.getOwnPropertyNames(
          rawSchema.patternProperties,
        ).map(p => ({ pattern: p, schema: rawSchema.patternProperties![p] }))
      }

      if (rawPatternProperties != null) {
        patternProperties = []
        for (const {
          pattern: propertyPattern,
          schema: rawPatternSchema,
        } of rawPatternProperties) {
          let propertyValueSchema = { ...rawPatternSchema }

          // 如果属性在 requiredProperties 中定义了，则其 required 默认值为 true
          const requiredIndex = requiredProperties.indexOf(propertyPattern)
          if (requiredIndex >= 0) {
            propertyValueSchema = {
              required: true,
              ...propertyValueSchema,
            }
          }
          const propertyCompileResult = this.context.compileDataSchema(
            propertyValueSchema,
          )
          result.addHandleResult(
            'patternProperties',
            propertyCompileResult,
            propertyPattern,
          )

          // 如果存在错误，则忽略此属性
          if (propertyCompileResult.hasError) continue

          // 检查该属性是否 required
          // 若是，则将其添加进 requiredProperties 中
          // 否则，则将其从 requiredProperties 中移除
          const propertySchema = propertyCompileResult.value!
          if (requiredIndex < 0 && propertySchema.required) {
            requiredProperties.push(propertyPattern)
          } else if (requiredIndex >= 0 && !propertySchema.required) {
            requiredProperties.splice(requiredIndex, 1)
          }

          let pattern: RegExp | undefined
          try {
            pattern = new RegExp(propertyPattern)
          } catch (e) {
            result.addError({
              constraint: 'patternProperties',
              property: propertyPattern,
              reason: `propertyName (${propertyPattern}) is not a valid regex. ${
                e.stack || e.message
              }`,
            })
          } finally {
            if (pattern != null) {
              patternProperties.push({
                pattern,
                schema: propertyCompileResult.value!,
              })
            }
          }
        }

        // 如果没有有效值，则置为 undefined
        if (Object.getOwnPropertyNames(patternProperties).length <= 0)
          patternProperties = undefined
      }
    }

    // 编译 propertyNames
    let propertyNames: ObjectDataSchema['propertyNames'] = undefined
    if (rawSchema.propertyNames != null) {
      if (rawSchema.propertyNames.type !== STRING_T_TYPE) {
        result.addError({
          constraint: 'propertyNames',
          reason: `propertyNames must be a StringDataSchema, but got (${stringify(
            rawSchema.propertyNames,
          )}).`,
        })
      } else {
        const propertyNamesCompileResult = this.context.compileDataSchema(
          rawSchema.propertyNames,
        )
        result.addHandleResult('propertyNames', propertyNamesCompileResult)
        // 如果存在错误，则忽略此属性
        if (!result.hasError) {
          propertyNames = propertyNamesCompileResult.value as StringDataSchema
        }
      }
    }

    // 编译 dependencies
    let dependencies: ObjectDataSchema['dependencies'] = undefined
    if (rawSchema.dependencies != null) {
      if (ensureObject('dependencies')) {
        dependencies = {}
        for (const propertyName of Object.getOwnPropertyNames(
          rawSchema.dependencies,
        )) {
          const propertyValue = rawSchema.dependencies[propertyName]
          const xResult = coverArray(coverString)(propertyValue)
          if (xResult.hasError) {
            result.addError({
              constraint: 'dependencies',
              reason: xResult.errorSummary,
            })
            continue
          }
          dependencies[propertyName] = propertyValue
        }
      }
    }

    // allowAdditionalProperties 的默认值为 false
    // 若 propertyNames 不为 null，则默认值为 true
    const allowAdditionalPropertiesResult = result.compileConstraint<boolean>(
      'allowAdditionalProperties',
      coverBoolean,
      propertyNames != null,
    )

    // ObjectDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValue,
      allowAdditionalProperties: Boolean(allowAdditionalPropertiesResult.value),
      silentIgnore: Boolean(silentIgnoreResult.value),
      properties,
      patternProperties,
      propertyNames,
      dependencies,
      requiredProperties,
    }

    return result.setValue(schema)
  }

  /**
   * override method
   * @see DataSchemaCompiler#normalizeRawSchema
   */
  public normalizeRawSchema(rawSchema: RDS): RDS {
    // eslint-disable-next-line no-param-reassign
    rawSchema = super.normalizeRawSchema(rawSchema)
    if (rawSchema.properties != null && isObject(rawSchema.properties)) {
      for (const propertyName of Object.getOwnPropertyNames(
        rawSchema.properties,
      )) {
        const rawPropertySchema: RDSchema = rawSchema.properties[propertyName]
        // eslint-disable-next-line no-param-reassign
        rawSchema.properties[propertyName] = {
          ...super.normalizeRawSchema(rawPropertySchema as RDS),
        }
      }
    }
    return rawSchema
  }

  /**
   * override method
   * @see DataSchemaCompiler#toJSON
   */
  public toJSON(schema: DS): Record<string, unknown> {
    const json: any = {
      ...super.toJSON(schema),
      requiredProperties: schema.requiredProperties,
      allowAdditionalProperties: schema.allowAdditionalProperties,
      dependencies: schema.dependencies,
      silentIgnore: schema.silentIgnore,
    }

    // json-ify properties
    if (
      schema.properties != null &&
      Object.getOwnPropertyNames(schema.properties).length > 0
    ) {
      json.properties = {}
      for (const propertyName of Object.getOwnPropertyNames(
        schema.properties,
      )) {
        json.properties[propertyName] = this.context.toJSON(
          schema.properties[propertyName],
        )
      }
    }

    // json-ify patternProperties
    if (
      schema.patternProperties != null &&
      schema.patternProperties.length > 0
    ) {
      json.patternProperties = []
      for (const property of schema.patternProperties) {
        const { pattern, schema: propertySchema } = property
        const propertySchemaJson = this.context.parseJSON(propertySchema)
        json.patternProperties.push({
          pattern: pattern.source,
          schema: propertySchemaJson,
        })
      }
    }

    if (schema.propertyNames != null) {
      json.propertyNames = this.context.toJSON(schema.propertyNames)
    }

    return json
  }

  /**
   * override method
   * @see DataSchemaCompiler#parseJSON
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public parseJSON(json: any): DS {
    const schema: DS = {
      ...super.parseJSON(json),
      requiredProperties: json.requiredProperties,
      allowAdditionalProperties: json.allowAdditionalProperties,
      dependencies: json.dependencies,
      silentIgnore: json.silentIgnore,
    }

    // parse properties
    if (
      json.properties != null &&
      Object.getOwnPropertyNames(json.properties).length > 0
    ) {
      schema.properties = {} as Exclude<DS['properties'], undefined>
      for (const propertyName of Object.getOwnPropertyNames(json.properties)) {
        schema.properties[propertyName] = this.context.parseJSON(
          json.properties[propertyName],
        )
      }
    }

    // parse patternProperties
    if (json.patternProperties != null && json.patternProperties.length > 0) {
      schema.patternProperties = []
      for (const property of json.patternProperties) {
        const { pattern, schema: propertySchemaJson } = property
        const propertySchema: DSchema = this.context.parseJSON(
          propertySchemaJson,
        )
        schema.patternProperties.push({
          pattern: new RegExp(pattern),
          schema: propertySchema,
        })
      }
    }

    if (json.propertyNames != null) {
      schema.propertyNames = this.context.parseJSON(
        json.propertyNames,
      ) as StringDataSchema
    }
    return schema
  }
}
