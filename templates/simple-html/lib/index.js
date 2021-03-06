const rollupPluginCopy =  require('@guanghechen/rollup-plugin-copy')
const fileUtil = require('./file-util')
const rollupPluginEmpty = require('./rollup-plugin-empty')

module.exports = {
  ...fileUtil,
  ...rollupPluginCopy,
  ...rollupPluginEmpty,
}
