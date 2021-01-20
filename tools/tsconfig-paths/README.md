[![npm version](https://img.shields.io/npm/v/@barusu/tool-tsconfig-paths.svg)](https://www.npmjs.com/package/@barusu/tool-tsconfig-paths)
[![npm download](https://img.shields.io/npm/dm/@barusu/tool-tsconfig-paths.svg)](https://www.npmjs.com/package/@barusu/tool-tsconfig-paths)
[![npm license](https://img.shields.io/npm/l/@barusu/tool-tsconfig-paths.svg)](https://www.npmjs.com/package/@barusu/tool-tsconfig-paths)


# Usage

  * Install
    ```shell
    yarn global add @barusu/tool-tsconfig-paths
    ```

  * Expand path alias to full path in `*.d.ts`
    ```shell
    barusu-tsconfig-paths . --tsconfigPath tsconfig.json --pattern lib/types/**/*.d.ts --src-root-dir=src --dst-root-dir=lib/types
    ```

# Options

  ```shell
  $ barusu-tsconfig-paths --help

  Usage: barusu-tsconfig-paths [options] [command]

  Options:
    -V, --version                                     output the version number
    --log-level <level>                               specify logger's level.
    --log-name <name>                                 specify logger's name.
    --log-mode <'normal' | 'loose'>                   specify logger's name.
    --log-flag <option>                               specify logger' option. [[no-]<date|colorful|inline>] (default: [])
    --log-filepath <filepath>                         specify logger' output path.
    --log-encoding <encoding>                         specify output file encoding.
    -c, --config-path <configFilepath>                config filepaths (default: [])
    --parastic-config-path <parasticConfigFilepath>   parastic config filepath
    --parastic-config-entry <parasticConfigFilepath>  parastic config filepath
    -h, --help                                        display help for command

  Commands:
    barusu-tsconfig-paths [options] <workspace>
    help [command]                                    display help for command
  ```
