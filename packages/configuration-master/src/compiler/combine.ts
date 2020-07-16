import {
  BaseDataSchemaCompiler,
  DataSchemaCompileResult,
  DataSchemaCompiler,
} from '../_core/compiler'
import { DSchema, RDSchema } from '../_core/schema'
import { coverString } from '../_util/cover-util'
import { stringify } from '../_util/string-util'
import {
  COMBINE_T_TYPE as T,
  COMBINE_V_TYPE as V,
  CombineDataSchema as DS,
  CombineStrategy,
  RawCombineDataSchema as RDS,
  combineStrategies,
} from '../schema/combine'


/**
 * CombineDataSchema 编译结果的数据类型
 */
export type CombineDataSchemaCompileResult = DataSchemaCompileResult<T, V, RDS, DS>


/**
 * 组合类型的模式的编译器
 *
 * enum 将忽略所有非组合（或组合字符串）的值
 */
export class CombineDataSchemaCompiler
  extends BaseDataSchemaCompiler<T, V, RDS, DS>
  implements DataSchemaCompiler<T, V, RDS, DS> {

  public readonly type: T = T

  /**
   * compile RawSchema to Schema
   * @param rawSchema
   */
  public compile (rawSchema: RDS): CombineDataSchemaCompileResult {
    const result: CombineDataSchemaCompileResult = super.compile(rawSchema)
    // eslint-disable-next-line no-param-reassign
    rawSchema = result._rawSchema

    const defaultValue = rawSchema.default

    // strategy 的默认值为 all
    const strategyResult = result.compileConstraint<CombineStrategy>('strategy', coverString as any, CombineStrategy.ALL)
    if (strategyResult.value == null || !combineStrategies.includes(strategyResult.value)) {
      result.addError({
        constraint: 'strategy',
        reason: `unknown strategy: ${ stringify(rawSchema.strategy) }`
      })
      strategyResult.setValue(CombineStrategy.ALL)
    }

    /**
     * 编译 DataSchema 列表
     *
     * @param constraint
     * @param rawSchemas
     */
    const compileSchemas = (constraint: 'allOf' | 'anyOf' | 'oneOf', rawSchemas?: RDSchema[]): DSchema[] | undefined => {
      if (rawSchemas == null || rawSchemas.length <= 0) return undefined
      const schemas: DSchema[] = []
      for (let i = 0; i < rawSchemas.length; ++i) {
        const itemRawSchema = rawSchemas[i]
        const itemSchema = this.context.compileDataSchema(itemRawSchema)
        result.addHandleResult(constraint, itemSchema)

        // 存在错误则跳过
        if (itemSchema.hasError) continue
        schemas.push(itemSchema.value!)
      }

      if (schemas.length <= 0) return undefined
      return schemas
    }

    const allOf: DSchema[] | undefined = compileSchemas('allOf', rawSchema.allOf)
    const anyOf: DSchema[] | undefined = compileSchemas('anyOf', rawSchema.anyOf)
    const oneOf: DSchema[] | undefined = compileSchemas('oneOf', rawSchema.oneOf)

    // allOf, anyOf, oneOf 至少要设置一项有效值
    if ((allOf == null || allOf.length <= 0) && (anyOf == null || anyOf.length <= 0) && (oneOf == null || oneOf.length <= 0)) {
      return result.addError({
        constraint: 'type',
        reason: 'CombineDataSchema must be set at least one valid value of properties: `allOf`, `anyOf`, `oneOf`.'
      })
    }

    // CombineDataSchema
    const schema: DS = {
      ...result.value!,
      default: defaultValue,
      strategy: strategyResult.value!,
      allOf,
      anyOf,
      oneOf,
    }

    return result.setValue(schema)
  }

  /**
   * override method
   * @see DataSchemaCompiler#toJSON
   */
  public toJSON(schema: DS): Record<string, unknown> {
    const json: any = {
      ...super.toJSON(schema),
      strategy: schema.strategy,
    }

    for (const propertyName of ['allOf', 'anyOf', 'oneOf']) {
      if (schema[propertyName] == null || schema[propertyName].length <= 0) continue
      json[propertyName] = (schema[propertyName] as DSchema[]).map(item => this.context.toJSON(item))
    }
    return json
  }

  /**
   * override method
   * @see DataSchemaCompiler#parseJSON
   */
  public parseJSON(json: any): DS {
    const schema: DS = {
      ...super.parseJSON(json),
      strategy: json.strategy,
    }

    for (const propertyName of ['allOf', 'anyOf', 'oneOf']) {
      if (json[propertyName] == null || json[propertyName].length <= 0) continue
      schema[propertyName] = json[propertyName]
        .map((item: Record<string, unknown>) => this.context.parseJSON(item))
    }
    return schema
  }
}
