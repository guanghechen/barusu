const fs = require('fs-extra')
const path = require('path')


/**
 * collect source files
 *
 * @param {string[]} srcFilePaths  source file/dir path list
 * @param {(filePath: string, stat: fs.Stat) => boolean} testFile test whether a file path should be collected
 */
function collectSrcFiles(srcFilePaths, testFile) {
  const resolvedStyleFilePaths = []
  const recursivelyCollect = (filePath) => {
    const stat = fs.statSync(filePath)
    if (testFile != null && !testFile(filePath, stat)) return

    if (stat.isFile()) {
      resolvedStyleFilePaths.push(filePath)
      return
    }

    const fileNames = fs.readdirSync(filePath)
    for (const f of fileNames) {
      const p = path.join(filePath, f)
      recursivelyCollect(p)
    }
  }

  if (typeof srcFilePaths === 'string') {
    recursivelyCollect(srcFilePaths)
  } else if (Array.isArray(srcFilePaths)) {
    for (const f of srcFilePaths) {
      recursivelyCollect(f)
    }
  }
  return resolvedStyleFilePaths
}


/**
 * calc target file path
 *
 * @param {string} srcRoot     root dir of source files
 * @param {string} dstRoot     root dir of target files
 * @param {string} srcFilePath source file path
 * @return {string} target file path
 */
function calcOutputFilePath(srcRoot, dstRoot, srcFilePath) {
  const srcRelativePath = path.relative(srcRoot, srcFilePath)
  const outputFilePath = path.join(dstRoot, srcRelativePath)
  return outputFilePath
}


module.exports = {
  collectSrcFiles,
  calcOutputFilePath,
}
