const { isBlank } = require('./option-util')


function empty() {
  const symbol = '__empty_input__'

  return {
    name: 'rollup-plugin-empty',
    options(inputOptions) {
      if (isBlank(inputOptions.input)) {
        // eslint-disable-next-line no-param-reassign
        inputOptions = {
          ...inputOptions,
          input: symbol,
        }
      }
      return inputOptions
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
