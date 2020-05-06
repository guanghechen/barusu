[![npm version](https://img.shields.io/npm/v/@barusu/tool-sort-imports.svg)](https://www.npmjs.com/package/@barusu/tool-sort-imports)
[![npm download](https://img.shields.io/npm/dm/@barusu/tool-sort-imports.svg)](https://www.npmjs.com/package/@barusu/tool-sort-imports)
[![npm license](https://img.shields.io/npm/l/@barusu/tool-sort-imports.svg)](https://www.npmjs.com/package/@barusu/tool-sort-imports)


# Usage

  * Install
    ```shell
    yarn add --dev @barusu/tool-sort-imports
    ```

  * Usage
    ```shell
    npx sort-imports 'src/**/*.ts'
    ```

# Options

## Overview

  ```shell
  $ sort-imports --help
  Usage: sort-imports <cwd> [options]

  Options:
    -V, --version                  output the version number
    --log-level <level>            specify logger's level.
    --log-name <name>              specify logger's name.
    --log-flag <option>            specify logger' option. [[no-]<date|colorful|inline>] (default: [])
    --log-output <filepath>        specify logger' output path.
    --log-encoding <encoding>      specify output file encoding.
    -P, --pattern <pattern>        glob pattern of source file (default: [])
    -e, --encoding <encoding>      encoding of source file
    --max-column <maxColumn>       maximum column width
    --indent <indent>              indent of source codes
    --quote <quote>                quotation marker surround the module path
    -M, --top-module <moduleName>  top modules (default: [])
    -h, --help                     display help for command
  ```


## Details
  * `--log-*`: see [cli-options | @barusu-logger](https://github.com/lemon-clown/barusu/tree/master/packages/chalk-logger#cli-options)

  * `-e, --encoding <encoding>`: Specify the encoding of the source files. Default value is `utf-8`

  * `-p, --pattern <pattern>`: Specify the glob pattern of source files, see [patterns option | globby](https://github.com/sindresorhus/globby#patterns). Default value is empty array `[]`

  * `--max-column <maxColumn>`: Specify the maximum column width, if the number of characters in one `import/export` statement exceeds this limit, line breaks will be performed. Default value is `1000`

  * `--indent <indent>`: Specify indent of source codes. Default value is two spaces `  `.

  * `--quote <quote>`: Specify the quotation marker surround the module path. Default value is single quotes `'`

  * `-M, --top-module <moduleName>`: Add fixed `topModules`. `topModules` are something that will always be fixed at the top of source file, and will not participate in the ordering of module names, their order depends on the order declared in the command line parameters. For example:
    - `sort-imports . -M react -M vue -M fs -M path`: then the `import/export` statement with these modules (`react` / `vue` / `fs` / `path`) Will always be fixed on top of source file, and their order (line numbers appearing in the source file) are following rule: `react` < `vue` < `fs` < `path`

## Options in <cwd>/package.json

  You can also specify options in the `<cwd>/package.json`, for example:
  ```json
  {
    "@barusu/tool-sort-imports": {
      "pattern": [
        "src/**/*.{ts,tsx}",
        "test/**/*.{ts,tsx}"
      ],
      "topModule": [
        "react",
        "vue",
        "fs",
        "fs-extra",
        "path",
        "glob"
      ],
      "indent": "  ",
      "quote": "'",
      "maxColumn": 100
    }
  }
  ```
