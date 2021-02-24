/**
 * 将对象内容转成字符串
 * @param x
 */
export function stringify(x: unknown): string {
  if (x == null) return '' + x
  return JSON.stringify(x)
}
