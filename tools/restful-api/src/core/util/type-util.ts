/**
 * 将对象内容转成字符串
 * @param x
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function stringify (x: any): string {
  if (x == null) return '' + x
  return JSON.stringify(x)
}
