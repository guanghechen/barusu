import { stringify } from './string-util'


/**
 * 处理结果的信息对象
 */
export abstract class HandleResult<T, E> {
  protected _value: T | undefined
  protected readonly _errors: E[]
  protected readonly _warnings: E[]

  public constructor(value?: T) {
    this._value = value
    this._errors = []
    this._warnings = []
  }

  /**
   * 处理的结果，当出现 error 时，此值应为 undefined
   */
  public get value(): T | undefined {
    return this._value
  }

  /**
   * 设置值
   * @param value
   */
  public setValue(value?: T): this {
    this._value = value
    return this
  }

  /**
   * 错误消息
   */
  public get errors(): E[] {
    return this._errors
  }

  /**
   * 获取错误消息的汇总
   */
  public abstract get errorSummary(): string

  /**
   * 检查是否存在错误消息
   */
  public get hasError(): boolean {
    return this._errors.length > 0
  }

  /**
   * 警告消息
   */
  public get warnings(): E[] {
    return this._warnings
  }

  /**
   * 获取警告消息的汇总
   */
  public abstract get warningSummary(): string

  /**
   * 检查是否存在警告消息
   */
  public get hasWarning(): boolean {
    return this._warnings.length > 0
  }

  /**
   * 追加校验错误信息对象
   * @param errors
   */
  public addError(...errors: E[]): this {
    this._errors.push(...errors)
    return this
  }

  /**
   * 追加校验警告信息对象
   * @param warnings
   */
  public addWarning(...warnings: E[]): this {
    this._warnings.push(...warnings)
    return this
  }


  /**
   * 合并结果
   * @param result
   */
  public merge(result: HandleResult<T, E>): this {
    this.addError(...result.errors)
    this.addWarning(...result.warnings)
    return this
  }
}


/**
 * 异常信息对象为字符串的处理结果
 */
export class StringExceptionHandleResult<T> extends HandleResult<T, string> {
  /**
   * 错误信息汇总
   */
  public get errorSummary(): string {
    return this.getSummary(this._errors)
  }

  /**
   * 警告消息汇总
   */
  public get warningSummary(): string {
    return this.getSummary(this._warnings)
  }

  /**
   * 消息汇总
   * @param exceptions
   */
  protected getSummary(exceptions: string[]): string {
    if (exceptions.length <= 0) return ''
    if (exceptions.length == 1) return exceptions[0]
    return '[' + exceptions.join(',\n') + ']'
  }
}


/**
 * 处理结果
 */
export interface DataHandleResultException {
  /**
   * 约束项
   */
  constraint: string
  /**
   * 错误原因
   */
  reason: string
  /**
   * 编译/校验 异常的属性名
   */
  property?: string
  /**
   * 错误的详情
   */
  traces?: DataHandleResultException[]
}


export class DataHandleResult<T> extends HandleResult<T, DataHandleResultException> {
  /**
   * 从结果信息对象中提取当前层级的错误原因
   * @param exception 异常信息对象
   * @param p         当前属性对应的路径
   */
  private calcSummary(exceptions: DataHandleResultException[], p=''): string[] {
    if (exceptions.length <= 0) return []
    const messages: string[] = []
    for (const exception of exceptions) {
      const c = exception.property != null ? (p.length > 0 ? p + '.' : p) + exception.property : p
      if (exception.traces == null || exception.traces.length <= 0) {
        const message = c + '#' + exception.constraint + ': ' + exception.reason
        messages.push(message)
        continue
      }
      messages.push(...this.calcSummary(exception.traces, c))
    }
    return messages
  }

  /**
   * 消息汇总
   * @param exceptions
   */
  private getSummary(exceptions: DataHandleResultException[]): string {
    const messages: string[] = this.calcSummary(exceptions)
    if (messages.length <= 0) return ''
    if (messages.length === 1) return messages[0]
    return '[' + messages.join(',\n') + ']'
  }

  /**
   * 错误消息汇总
   */
  public get errorSummary(): string {
    return this.getSummary(this._errors)
  }

  /**
   * 警告消息汇总
   */
  public get warningSummary(): string {
    return this.getSummary(this._warnings)
  }

  /**
   * 错误详情
   */
  public get errorDetails(): string {
    return stringify(this._errors)
  }

  /**
   * 警告详情
   */
  public get warningDetails(): string {
    return stringify(this._warnings)
  }

  /**
   * 追加错误信息对象
   * @param errors
   */
  public addError(...errors: DataHandleResultException[]): this {
    for (const error of errors) {
      const e = { ...error }
      if (e.property == null || e.property.length <= 0) e.property = undefined
      this._errors.push(e)
    }
    return this
  }

  /**
   * 追加警告信息对象
   * @param warnings
   */
  public addWarning(...warnings: DataHandleResultException[]): this {
    for (const warning of warnings) {
      const w = { ...warning }
      if (w.property == null || w.property.length <= 0) w.property = undefined
      this._warnings.push(w)
    }
    return this
  }

  /**
   *
   * @param constraint  约束信息
   * @param property    属性名称
   * @param result      校验结果
   * @param errReason   错误原因
   */
  public addHandleResult<V>(
    constraint: string,
    result: DataHandleResult<V>,
    property?: string,
    errReason = ''
  ): this {
    if (result.hasError) {
      const e = {
        constraint,
        property,
        reason: errReason,
        traces: result.errors,
      }
      if (e.reason.length <= 0) {
        e.reason = this.getSummary([e])
      }
      this.addError(e)
    }
    if (result.hasWarning) {
      const w = {
        constraint,
        property,
        reason: '',
        traces: result.warnings,
      }
      w.reason = this.getSummary([w])
      this.addWarning(w)
    }
    return this
  }
}
