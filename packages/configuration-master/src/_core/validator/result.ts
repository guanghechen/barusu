import {
  DataHandleResult,
  DataHandleResultException,
} from '../../_util/handle-result'
import { stringify } from '../../_util/string-util'
import { DataSchema } from '../schema'


/**
 * 数据项的校验结果
 *
 * @template T    typeof <X>DataSchema.type
 * @template V    typeof <X>DataSchema.V
 * @template DS   typeof <X>DataSchema
 */
export class DataValidationResult<
  T extends string, V,
  DS extends DataSchema<T, V>,
  > extends DataHandleResult<V> {
  public readonly _schema: DS

  public constructor(schema: DS) {
    super()
    this._schema = schema
  }

  /**
   * 生成 type 校验失败的异常对象
   * @param data          待校验的数据
   * @param extraMessage  附加信息
   */
  public typeConstraintException(data: unknown, extraMessage?: string): DataHandleResultException {
    const schema = this._schema
    const a = /^[aeiou]/.test(schema.type) ? 'an' : 'a'
    const reason = `expected ${ a } ${ schema.type }, but got (${ stringify(data) })`
      + (extraMessage != null ? ': ' + extraMessage : '.')
    return { constraint: 'type', reason }
  }
}
