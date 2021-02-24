import {
  BaseDataSchemaCompiler,
  DataSchemaCompileResult,
  DataSchemaCompiler,
} from '../_core/compiler'
import { coverString } from '../_util/cover-util'
import { stringify } from '../_util/string-util'
import {
  REF_T_TYPE as T,
  REF_V_TYPE as V,
  RawRefDataSchema as RDS,
  RefDataSchema as DS,
} from '../schema/ref'

/**
 * RefDataSchema 编译结果的数据类型
 */
export type RefDataSchemaCompileResult = DataSchemaCompileResult<T, V, RDS, DS>

/**
 * 引用类型的模式的编译器
 */
export class RefDataSchemaCompiler
  extends BaseDataSchemaCompiler<T, V, RDS, DS>
  implements DataSchemaCompiler<T, V, RDS, DS> {
  public readonly type: T = T

  /**
   * compile RawSchema to Schema
   * @param rawSchema
   */
  public compile(rawSchema: RDS): RefDataSchemaCompileResult {
    const result: RefDataSchemaCompileResult = super.compile(rawSchema)
    // eslint-disable-next-line no-param-reassign
    rawSchema = result._rawSchema

    // check $ref
    const $refResult = result.compileConstraint<string>('$ref', coverString)
    if ($refResult.hasError || $refResult.value == null) {
      return result.addError({
        constraint: '$ref',
        reason: `bad \`$ref\`, expected a string, but got (${stringify(
          rawSchema.$ref,
        )}).`,
      })
    }

    // check if the referenced DataSchema exists
    const $ref = $refResult.value!
    if (!this.context.hasDefinition($ref)) {
      return result.addError({
        constraint: '$ref',
        reason: `bad \`$ref\`, cannot find DataSchema with $id(${$ref})`,
      })
    }

    // set the default value of the optional property to the property value
    // corresponding to the referenced DataSchema
    const rawDefinitionSchema = this.context.getRawDefinition($ref)!
    // eslint-disable-next-line no-param-reassign
    rawSchema = this.context.inheritRawSchema(rawDefinitionSchema, rawSchema)
    const basicResult: RefDataSchemaCompileResult = super.compile(rawSchema)

    // RefDataSchema
    const schema: DS = {
      ...basicResult.value!,
      $ref,
      default: rawSchema.default,
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
      $ref: schema.$ref,
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
      $ref: json.$ref,
    }
    return schema
  }
}
