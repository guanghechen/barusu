import { createStaticImportOrExportRegexList, execWithMultipleRegex } from '../src/util'


describe('regex', function () {
  const regexList = createStaticImportOrExportRegexList('')
  const exec = (content: string): RegExpExecArray | null => {
    const result = execWithMultipleRegex(regexList, content)
    if (result == null) return null
    return result.result
  }

  it('import only', function () {
    const result = exec('import "module-name";')
    expect(result).not.toBeNull()
    expect(result!.groups).toEqual({
      type: 'import',
      quote: '"',
      moduleName: 'module-name',
      remainOfLine: '',
    })
  })

  describe('import type', function () {
    it('base', function () {
      const result = exec('import type { ClassType } from "module-name";')
      expect(result).not.toBeNull()
      expect(result!.groups).toEqual({
        type: 'import',
        quote: '"',
        typeImportOrExport: 'type',
        exportN: 'ClassType',
        from: 'from',
        moduleName: 'module-name',
        remainOfLine: '',
      })
    })

    it('space before \'{\' is optional', function () {
      const result = exec('import type{ ClassType } from "module-name";')
      expect(result).not.toBeNull()
      expect(result!.groups).toEqual({
        type: 'import',
        quote: '"',
        typeImportOrExport: 'type',
        exportN: 'ClassType',
        from: 'from',
        moduleName: 'module-name',
        remainOfLine: '',
      })
    })
  })

  describe('default import', function () {
    it('base', function () {
      const result = exec('import defaultExport from "module-name";')
      expect(result).not.toBeNull()
      expect(result!.groups).toEqual({
        type: 'import',
        defaultExport: 'defaultExport',
        quote: '"',
        from: 'from',
        moduleName: 'module-name',
        remainOfLine: '',
      })
    })

    it('+import all 1', function () {
      const result = exec('import defaultExport, * as name from "module-name";')
      expect(result).not.toBeNull()
      expect(result!.groups).toEqual({
        type: 'import',
        defaultExport: 'defaultExport, * as name',
        quote: '"',
        from: 'from',
        moduleName: 'module-name',
        remainOfLine: '',
      })
    })

    it('+import all 2', function () {
      const result = exec('import defaultExport * as name from "module-name";')
      expect(result).toBeNull()
    })

    it('+import all 3', function () {
      const result = exec('import * as name, defaultExport from "module-name";')
      expect(result).toBeNull()
    })

    it('+import alias', function () {
      const result = exec('import React, { useEffect, useState as waw } from \'react\'')
      expect(result!.groups).toEqual({
        type: 'import',
        defaultExport: 'React',
        exportN: 'useEffect, useState as waw',
        quote: '\'',
        from: 'from',
        moduleName: 'react',
        remainOfLine: '',
      })
    })
  })

  describe('import alias', function () {
    it('base', function () {
      const result = exec('import * as name from "module-name";')
      expect(result).not.toBeNull()
      expect(result!.groups).toEqual({
        type: 'import',
        defaultExport: '* as name',
        quote: '"',
        from: 'from',
        moduleName: 'module-name',
        remainOfLine: '',
      })
    })
  })

  describe('importN', function () {
    it('base', function () {
      const result = exec('import { export } from "module-name";')
      expect(result).not.toBeNull()
      expect(result!.groups).toEqual({
        type: 'import',
        exportN: 'export',
        quote: '"',
        from: 'from',
        moduleName: 'module-name',
        remainOfLine: '',
      })
    })

    it('+alias 1', function () {
      const result = exec('import { export as alias } from "module-name";')
      expect(result).not.toBeNull()
      expect(result!.groups).toEqual({
        type: 'import',
        exportN: 'export as alias',
        quote: '"',
        from: 'from',
        moduleName: 'module-name',
        remainOfLine: '',
      })
    })

    it('+alias 2', function () {
      const result = exec('import { export1 , export2 as alias2, export3 } from "module-name";')
      expect(result).not.toBeNull()
      expect(result!.groups).toEqual({
        type: 'import',
        exportN: 'export1 , export2 as alias2, export3',
        quote: '"',
        from: 'from',
        moduleName: 'module-name',
        remainOfLine: '',
      })
    })

    it('+multiple', function () {
      const result = exec('import { export1 , export2 } from "module-name";')
      expect(result).not.toBeNull()
      expect(result!.groups).toEqual({
        type: 'import',
        exportN: 'export1 , export2',
        quote: '"',
        from: 'from',
        moduleName: 'module-name',
        remainOfLine: '',
      })
    })

    it('+multiple +(long module path)', function () {
      const result = exec('import { foo , bar } from "module-name/path/to/specific/un-exported/file";')
      expect(result).not.toBeNull()
      expect(result!.groups).toEqual({
        type: 'import',
        exportN: 'foo , bar',
        quote: '"',
        from: 'from',
        moduleName: 'module-name/path/to/specific/un-exported/file',
        remainOfLine: '',
      })
    })
  })
})
