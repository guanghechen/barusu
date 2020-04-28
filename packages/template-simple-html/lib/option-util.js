/**
 * check whether data is empty/blank
 */
function isBlank(data) {
  if (data == null) return true
  if (typeof data === 'string') return data.length <= 0
  if (Array.isArray(data)) return data.length <= 0
  return true
}


module.exports = {
  isBlank,
}
