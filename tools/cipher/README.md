[![npm version](https://img.shields.io/npm/v/@barusu/tool-cipher.svg)](https://www.npmjs.com/package/@barusu/tool-cipher)
[![npm download](https://img.shields.io/npm/dm/@barusu/tool-cipher.svg)](https://www.npmjs.com/package/@barusu/tool-cipher)
[![npm license](https://img.shields.io/npm/l/@barusu/tool-cipher.svg)](https://www.npmjs.com/package/@barusu/tool-cipher)


Encrypt the working directory (Default algorithm: AES-256 gcm ).


# Usage

  * Install
    ```shell
    yarn add --dev @barusu/tool-cipher
    ```

  * init
    ```shell
    barusu-cipher init <dir>
    ```

  * encrypt
    ```shell
    barusu-cipher encrypt <dir>
    ```

  * decrypt
    ```shell
    barusu-cipher decrypt <dir>
    ```


# Options

## Overview

  ```shell
  $ barusu-cipher --help
  Usage: barusu-cipher [options] [command]

  Options:
    -V, --version                  output the version number
    --log-level <level>            specify logger's level.
    --log-name <name>              specify logger's name.
    --log-flag <option>            specify logger' option. [[no-]<date|colorful|inline>] (default: [])
    --log-output <filepath>        specify logger' output path.
    --log-encoding <encoding>      specify output file encoding.
    -h, --help                     display help for command

  Commands:
    init [options] <directory>
    encrypt [options] <directory>
    decrypt [options]
    help [command]                 display help for command
  ```

## init

  ```shell
  $ barusu-cipher init --help
  Usage: barusu-cipher init [options] <directory>

  Options:
    -S, --secret-filepath <secret filepath>  path of secret file
    --show-asterisk                          whether to print password asterisks
    --minimum-password-length                the minimum size required of password
    -h, --help                               display help for command
  ```

## encrypt

  ```shell
  $ barusu-cipher encrypt --help
  Usage: barusu-cipher encrypt [options] <directory>

  Options:
    -S, --secret-filepath <secret filepath>      path of secret file
    -I, --index-filepath <cipher files index>    path of index of cipher files
    -P, --plain-filepath-pattern <glob pattern>  glob pattern of files to be encrypted (default: [])
    -o, --out-dir <outDir>                       root dir of outputs
    -f, --force                                  do decrypt event the target filepath has already exists.
    --show-asterisk                              whether to print password asterisks
    --minimum-password-length                    the minimum size required of password
    -h, --help                                   display help for command
  ```

## decrypt

  ```shell
  $ barusu-cipher encrypt --help
  Usage: barusu-cipher decrypt [options]

  Options:
    -S, --secret-filepath <secret filepath>       path of secret file
    -I, --index-filepath <cipher files index>     path of index of cipher files
    -C, --cipher-filepath-pattern <glob pattern>  glob pattern of files have been encrypted (default: [])
    -o, --out-dir <outDir>                        root dir of outputs
    --cipher-dir <cipherDir>                      root dir of cipher files
    -f, --force                                   do encrypt event the target filepath has already exists.
    --show-asterisk                               whether to print password asterisks
    --minimum-password-length                     the minimum size required of password
    -h, --help                                    display help for command
  ```


# Demo
  You can specify configs into `package.json` like below:

  ```json
  {
    "@barusu/tool-cipher": {
      "__globalOptions__": {
        "logLevel": "debug",
        "secretFilepath": ".barusu.secret",
        "indexFilepath": ".barusu-index",
        "showAsterisk": true,
        "plainFilepathPatterns": [
          "plain/*"
        ]
      },
      "encrypt": {
        "outDir": "cipher"
      },
      "decrypt": {
        "outDir": "plain-bak",
        "cipherDir": "cipher"
      }
    }
  }
  ```

  While `__globalOptions__` is the global option, `encrypt` is the option for the sub-command `encrypt` and etc.
