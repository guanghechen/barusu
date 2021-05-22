<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/barusu/tree/main/tools/word#readme">@barusu/tool-word</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@barusu/tool-word">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@barusu/tool-word.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/tool-word">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@barusu/tool-word.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/tool-word">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@barusu/tool-word.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@barusu/tool-word"
      />
    </a>
    <a href="https://github.com/tj/commander.js/">
      <img
        alt="React version"
        src="https://img.shields.io/npm/dependency-version/@barusu/tool-word/commander"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Tested with Jest"
        src="https://img.shields.io/badge/tested_with-jest-9c465e.svg"
      />
    </a>
    <a href="https://github.com/prettier/prettier">
      <img
        alt="Code Style: prettier"
        src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
      />
    </a>
  </div>
</header>
<br/>


Count the frequency of characters in the file(s).


## Install

  ```bash
  npm install -g @barusu/tool-word
  ```

* yarn

  ```bash
  yarn global add @barusu/tool-word
  ```

## Usage

  * Usage
    ```shell
    barusu-word stat src --show-details-pretty

    # specify file patterns
    barusu-word stat . -p 'src/**/*.ts' -p '!src/**/*.tmp.ts' --show-details-pretty

    # specify file paths
    barusu-word stat . -f src/a.md -f src/b.ts --show-details-pretty
    ```

### Options

## Overview

  ```shell
  $ barusu-word --help
  Usage: barusu-word [options] [command]

  Options:
    -V, --version                                     output the version number
    --log-level <level>                               specify logger's level.
    --log-name <name>                                 specify logger's name.
    --log-mode <'normal' | 'loose'>                   specify logger's name.
    --log-flag <option>                               specify logger' option. [[no-]<date|colorful|inline>] (default: [])
    --log-output <filepath>                           specify logger' output path.
    --log-encoding <encoding>                         specify output file encoding.
    -c, --config-path <configFilepath>                config filepaths (default: [])
    --parastic-config-path <parasticConfigFilepath>   parastic config filepath
    --parastic-config-entry <parasticConfigFilepath>  parastic config filepath
    --encoding <encoding>                             default encoding of files in the workspace
    -h, --help                                        display help for command

  Commands:
    stat|s [options] <workspac>
    help [command]                                    display help for command
  ```

### stat
  ```shell
  $ barusu-word stat --help
  Usage: barusu-word stat|s [options] <workspace | filepath>

  Options:
    -f, --file-path <filePath>        source file path using to give statistics (default: [])
    -p, --file-pattern <filePattern>  file wildcard list using to give statistics (default: [])
    --show-details <lineNumber>       rows in the word frequency ranking list to be displayed
    --show-details-pretty             Filter out blank and punctuation characters & set --show-details default to 10
    --show-summary-only               display summary statistics only
    -h, --help                        display help for command                                   display help for command
  ```

## Example

### stat

  * Stat file
    ```shell
    $ barusu-word stat package.json --show-details-pretty

    package.json
    ======================================================
                       total: 1454
                 blank total:  273
           punctuation total:  388
                unique total:   68
          unique blank total:    2
    unique punctuation total:   17
                     details:
                     -----------------
                         "s":   59
                         "e":   57
                         "t":   52
                         "o":   50
                         "i":   50
                         "r":   49
                         "l":   49
                         "n":   42
                         "u":   38
    ```

  * Stat directory
    ```shell
    $ barusu-word stat src/util --show-details-pretty --show-summary-only

    Summary
    ======================================================
                       total: 4867
                 blank total: 1226
           punctuation total:  504
                unique total:   74
          unique blank total:    2
    unique punctuation total:   20
                     details:
                     -----------------
                         "t":  399
                         "a":  321
                         "e":  242
                         "r":  210
                         "n":  202
                         "o":  197
                         "l":  175
                         "i":  162
                         "u":  154
                         "c":  146
    ```

  * Stat with pattern
    ```shell
    $ barusu-word stat src -p 'util/*.ts' -p '!util/logger.ts' --show-details-pretty --show-summary-only

    Summary
    ======================================================
                      total: 4655
                blank total: 1194
          punctuation total:  477
                unique total:   72
          unique blank total:    2
    unique punctuation total:   20
                    details:
                    -----------------
                        "t":  393
                        "a":  315
                        "e":  230
                        "n":  199
                        "r":  195
                        "o":  182
                        "l":  164
                        "i":  160
                        "u":  149
                        "c":  143
    ```
