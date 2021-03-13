const { isNonBlankString } = require('@guanghechen/option-helper')


function empty() {
  const symbol = '__empty_input__'

  return {
    name: 'rollup-plugin-empty',
    options(inputOptions) {
      if (isNonBlankString(inputOptions.input)) return inputOptions
      return {
        ...inputOptions,
        input: symbol,
      }
    },
    resolveId(source) {
      if (source === symbol) return symbol
      return null
    },
    load(id) {
      if (id === symbol) {
        return 'export default \'\''
      }
      return null
    }
  }
}


module.exports = {
  empty
}
