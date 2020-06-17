[![npm version](https://img.shields.io/npm/v/@barusu/tool-cipher.svg)](https://www.npmjs.com/package/@barusu/tool-cipher)
[![npm download](https://img.shields.io/npm/dm/@barusu/tool-cipher.svg)](https://www.npmjs.com/package/@barusu/tool-cipher)
[![npm license](https://img.shields.io/npm/l/@barusu/tool-cipher.svg)](https://www.npmjs.com/package/@barusu/tool-cipher)


# Usage

  * Install
    ```shell
    yarn add --dev @barusu/tool-cipher
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
    ----semicolon                  whether to add a semicolon at the end of import/export statement
    -h, --help                     display help for command
  ```


## Details
  * `--log-*`: see [cli-options | @barusu-logger](https://github.com/lemon-clown/barusu/tree/master/packages/chalk-logger#cli-options)

  * `-e, --encoding <encoding>`: Specify the encoding of the source files. Default value is `utf-8`

  * `-p, --pattern <pattern>`: Specify the glob pattern of source files, see [patterns option | globby](https://github.com/sindresorhus/globby#patterns). Default value is empty array `[]`

  * `--max-column <maxColumn>`: Specify the maximum column width, if the number of characters in one `import/export` statement exceeds this limit, line breaks will be performed. Default value is `1000`

  * `--indent <indent>`: Specify indent of source codes. Default value is two spaces `  `.

  * `--quote <quote>`: Specify the quotation marker surround the module path. Default value is single quotes `'`

  * `--semicolon`: Specify whether to add a semicolon at the end of `import/export` statement. Default value is `false`

## Options in <cwd>/package.json

  You can also specify options in the `<cwd>/package.json`, for example:
  ```json
  {
    "@barusu/tool-cipher": {
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
      "maxColumn": 100
    }
  }
  ```

  * `moduleRanks` specified module rank when sort `import/export` statements. If a module path matches multiple items, only the first matched item is taken.
