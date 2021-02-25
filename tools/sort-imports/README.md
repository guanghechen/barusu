[![npm version](https://img.shields.io/npm/v/@barusu/tool-sort-imports.svg)](https://www.npmjs.com/package/@barusu/tool-sort-imports)
[![npm download](https://img.shields.io/npm/dm/@barusu/tool-sort-imports.svg)](https://www.npmjs.com/package/@barusu/tool-sort-imports)
[![npm license](https://img.shields.io/npm/l/@barusu/tool-sort-imports.svg)](https://www.npmjs.com/package/@barusu/tool-sort-imports)


# Usage

  * Install
    ```shell
    yarn global add @barusu/tool-sort-imports
    ```

  * Usage
    ```shell
    barusu-sort-imports 'src/**/*.ts'
    ```

# Options

## Overview

  ```shell
  $ barusu-sort-imports --help
  Usage: barusu-sort-imports <cwd> [options]

  Options:
Options:
  -V, --version                                     output the version number
  --log-level <level>                               specify logger level.
  --log-name <name>                                 specify logger name.
  --log-mode <'normal' | 'loose'>                   specify logger name.
  --log-flag <option>                               specify logger option. [[no-]<date|title|colorful|inline>] (default: [])
  --log-filepath <filepath>                         specify logger output path.
  --log-encoding <encoding>                         specify output file encoding.
  -c, --config-path <configFilepath>                config filepaths (default: [])
  --parastic-config-path <parasticConfigFilepath>   parastic config filepath
  --parastic-config-entry <parasticConfigFilepath>  parastic config filepath
  -P, --pattern <pattern>                           glob pattern of source file (default: [])
  -e, --encoding <encoding>                         encoding of source file
  --max-column <maxColumn>                          maximum column width
  --indent <indent>                                 indent of source codes
  --quote <quote>                                   quotation marker surround the module path
  --semicolon                                       whether to add a semicolon at the end of import/export statement
  --type-first                                      whether the type import/export statements rank ahead
  --blank-line-after-statement                      blank lines after import/export statement
  -h, --help                                        display help for command
  ```


## Details
  * `--log-*`: see [cli-options | @barusu-logger](https://github.com/guanghechen/barusu/tree/master/packages/chalk-logger#cli-options)

  * `-e, --encoding <encoding>`: Specify the encoding of the source files.

    - Default: `utf-8`

  * `-p, --pattern <pattern>`: Specify the glob pattern of source files, see
    [patterns option | globby](https://github.com/sindresorhus/globby#patterns).

    - Default: `[]`

  * `--max-column <maxColumn>`: Specify the maximum column width, if the number
    of characters in one `import/export` statement exceeds this limit, line
    breaks will be performed.

    - Default: `1000`

  * `--indent <indent>`: Specify indent of source codes.

    - Default: `  `

  * `--quote <quote>`: Specify the quotation marker surround the module path.

    - Default: `'`

  * `--semicolon`: Specify whether to add a semicolon at the end of `import/export` statement.

    - Default: `false`

  * `--type-first`: Whether should make the *type `import/export`* statements printed first.

    - Default: `true`

  * `--blank-line-after-statement`: Blank lines after `import/export` statement.

    - Default: 2

## Options in <cwd>/package.json

  You can also specify options in the `<cwd>/package.json`, for example:
  ```json
  {
    "@barusu/tool-sort-imports": {
      "pattern": [
        "src/**/*.{ts,tsx}",
        "test/**/*.{ts,tsx}"
      ],
      "moduleRanks": [
        {
          "regex": "^(react|vue|angular)(?:[\/\\-][\\w\\-.\/]*)?$",
          "rank": 1.1
        },
        {
          "regex": "^mocha|chai(?:[\/][\\w\\-.\/]*)?$",
          "rank": 1.2
        },
        {
          "regex": "^[a-zA-Z\\d][\\w\\-.]*",
          "rank": 1.3
        },
        {
          "regex": "^@[a-zA-Z\\d][\\w\\-.]*\\/[a-zA-Z\\d][\\w\\-.]*",
          "rank": 1.4
        },
        {
          "regex": "^@\\/",
          "rank": 2.1
        },
        {
          "regex": "^(?:\\/|[a-zA-Z]:)",
          "rank": 3.1
        },
        {
          "regex": "^[.]{2}[\\/\\\\][^\\n]*",
          "rank": 3.2
        },
        {
          "regex": "^[.][\\/\\\\][^\\n]*",
          "rank": 3.3
        }
      ],
      "indent": "  ",
      "quote": "'",
      "semicolon": false,
      "maxColumn": 100,
      "typeFirst": true,
      "blankLinesAfterStatement": 1
    }
  }
  ```

  * `moduleRanks` specified module rank when sort `import/export` statements.
    If a module path matches multiple items, only the first matched item is taken.
