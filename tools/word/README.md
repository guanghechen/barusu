[![npm version](https://img.shields.io/npm/v/@barusu/tool-word.svg)](https://www.npmjs.com/package/@barusu/tool-word)
[![npm download](https://img.shields.io/npm/dm/@barusu/tool-word.svg)](https://www.npmjs.com/package/@barusu/tool-word)
[![npm license](https://img.shields.io/npm/l/@barusu/tool-word.svg)](https://www.npmjs.com/package/@barusu/tool-word)


Count the frequency of characters in the file(s).


# Usage

  * Install
    ```shell
    yarn global add @barusu/tool-word
    ```

  * Usage
    ```shell
    barusu-word stat src --show-details-pretty

    # specify file patterns
    barusu-word stat . -p 'src/**/*.ts' -p '!src/**/*.tmp.ts' --show-details-pretty

    # specify file paths
    barusu-word stat . -f src/a.md -f src/b.ts --show-details-pretty
    ```

# Options

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

## stat
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
