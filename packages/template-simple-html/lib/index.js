const fileUtil = require('./file-util')
const rollupPluginEmpty = require('./rollup-plugin-empty')

module.exports = {
  ...fileUtil,
  ...rollupPluginEmpty,
}
