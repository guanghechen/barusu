/**
 * resize length of array
 * @param arr
 * @param size
 * @param defaultValue
 */
export function resize<T>(arr: T[], size: number, defaultValue: T) {
  // Remove extra elements
  if (arr.length > size) {
    arr.splice(size, arr.length - size)
    return
  }

  // Fill the rest of array with defaultValue
  const length = arr.length
  for (let i = length; i < size; ++i) {
    arr.push(defaultValue)
  }
}
