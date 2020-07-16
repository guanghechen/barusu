/**
 * 将 T 中的部分属性置为可选
 */
declare type PickPartial<T, P extends keyof T> = Omit<T, P> & Partial<Pick<T, P>>
