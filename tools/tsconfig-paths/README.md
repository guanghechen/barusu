<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/barusu/tree/master/tools/tsconfig-pathsl#readme">@barusu/tool-tsconfig-paths</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@barusu/tool-tsconfig-paths">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@barusu/tool-tsconfig-paths.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/tool-tsconfig-paths">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@barusu/tool-tsconfig-paths.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/tool-tsconfig-paths">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@barusu/tool-tsconfig-paths.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@barusu/tool-tsconfig-paths"
      />
    </a>
    <a href="https://github.com/tj/commander.js/">
      <img
        alt="React version"
        src="https://img.shields.io/npm/dependency-version/@barusu/tool-tsconfig-paths/commander"
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


## Install

  ```bash
  npm install -g @barusu/tool-tsconfig-paths
  ```

* yarn

  ```bash
  yarn global add @barusu/tool-tsconfig-paths
  ```

## Usage

  * Expand path alias to full path in `*.d.ts`
    ```shell
    barusu-tsconfig-paths . --tsconfigPath tsconfig.json --pattern lib/types/**/*.d.ts --src-root-dir=src --dst-root-dir=lib/types
    ```

### Options

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
