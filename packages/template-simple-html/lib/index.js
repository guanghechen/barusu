const fileUtil = require('./file-util')
const rollupPluginCopy = require('./rollup-plugin-copy')
const rollupPluginEmpty = require('./rollup-plugin-empty')

module.exports = {
  ...fileUtil,
  ...rollupPluginCopy,
  ...rollupPluginEmpty,
}
