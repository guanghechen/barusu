/**
 * 将 T 中的部分属性置为可选
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare type PickPartial<T, P extends keyof T> = Omit<T, P> &
  Partial<Pick<T, P>>
