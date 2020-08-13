[![npm version](https://img.shields.io/npm/v/@barusu/tool-git-cipher.svg)](https://www.npmjs.com/package/@barusu/tool-git-cipher)
[![npm download](https://img.shields.io/npm/dm/@barusu/tool-git-cipher.svg)](https://www.npmjs.com/package/@barusu/tool-git-cipher)
[![npm license](https://img.shields.io/npm/l/@barusu/tool-git-cipher.svg)](https://www.npmjs.com/package/@barusu/tool-git-cipher)


* Fully encrypt the git repository
  - Prepare a directory `plaintextRootDir`, which tracks (or uses it as the source repository directly) the git repository to be encrypted. Every time the encrypt command is executed, the content under the path `plaintextRootDir` will be encrypted and stored into directory `ciphertextRootDir`, and the structure of the file will be saved in `indexFilepath`.

  - Support incremental update content, determine whether the file needs to be re-encrypted by comparing the latest modified time of the source file.

  - The secret key to encrypt the `plaintextRootDir` directory is encrypted by a password entered by the user and saved in the `secretFilepath` file. This file also saves the encrypted result of the mac value of the original key, which is used to verify whether the subsequent input password is correct.

  - Default algorithm `AES-256 gcm`.

# Usage

  * Install
    ```shell
    yarn add --dev @barusu/tool-git-cipher
    ```

  * init
    ```shell
    barusu-git-cipher init <workspace dir>
    ```

  * encrypt
    ```shell
    barusu-git-cipher encrypt <workspace dir>
    ```

  * decrypt
    ```shell
    barusu-git-cipher decrypt <workspace dir>
    ```


# Options

## Overview

  ```shell
  $ barusu-git-cipher --help

  Usage: barusu-git-cipher [options] [command]

  Options:
    -V, --version                                       output the version number
    --log-level <level>                                 specify logger's level.
    --log-name <name>                                   specify logger's name.
    --log-mode <'normal' | 'loose'>                     specify logger's name.
    --log-flag <option>                                 specify logger' option. [[no-]<date|colorful|inline>] (default: [])
    --log-output <filepath>                             specify logger' output path.
    --log-encoding <encoding>                           specify output file encoding.
    -c, --config-path <config filepath>                  (default: [])
    --parastic-config-path <parastic config filepath>
    --parastic-config-entry <parastic config filepath>
    --encoding <encoding>                               default encoding of files in the workspace
    --secret-filepath <secretFilepath>                  path of secret file
    --secret-file-encoding <secretFileEncoding>         encoding of secret file
    --index-filepath <indexFilepath>                    path of index file of ciphertext files
    --index-file-encoding <indexFileEncoding>           encoding of index file
    --ciphertext-root-dir <ciphertextRootDir>           the directory where the encrypted files are stored
    --plaintext-root-dir <plaintextRootDir>             the directory where the source plaintext files are stored
    --show-asterisk                                     whether to print password asterisks
    --minimum-password-length                           the minimum size required of password
    -h, --help                                          display help for command

  Commands:
    init|i <workspace>
    encrypt|e [options] <workspace>
    decrypt|d <workspace>
    help [command]                                      display help for command
  ```

## init

  ```shell
  $ barusu-git-cipher init --help

  Usage: barusu-git-cipher init|i [options] <workspace>

  Options:
    -h, --help  display help for command
  ```

## encrypt

  ```shell
  $ barusu-git-cipher encrypt --help

  Usage: barusu-git-cipher encrypt|e [options] <workspace>

  Options:
    --full                   Full quantity update
    --update-before-encrypt  Perform 'git fetch --all' before run encryption
    -h, --help               display help for command
  ```

## decrypt

  ```shell
  $ barusu-git-cipher decrypt --help

  Usage: barusu-git-cipher decrypt|d [options] <workspace>

  Options:
    --out-dir <outDir>  Root dir of outputs (decrypted files)
    -h, --help          display help for command
  ```


# Demo
  You can specify configs into `package.json` like below:

  ```json
  {
    "name": "private-repository-demo",
    "version": "0.0.0",
    "private": true,
    "scripts": {
      "encrypt": "barusu-git-cipher encrypt .",
      "decrypt": "barusu-git-cipher decrypt ."
    },
    "devDependencies": {
      "@barusu/tool-git-cipher": "^0.0.23"
    },
    "@barusu/tool-git-cipher": {
      "__globalOptions__": {
        "logLevel": "info",
        "encoding": "utf-8",
        "secretFilepath": ".barusu-secret",
        "secretFileEncoding": "utf-8",
        "indexFilepath": ".barusu-index",
        "indexFileEncoding": "utf-8",
        "ciphertextRootDir": "barusu-ciphertext",
        "plaintextRootDir": "barusu-plaintext",
        "showAsterisk": true
      },
      "encrypt": {
        "updateBeforeEncrypt": true
      },
      "decrypt": {
        "outDir": "barusu-plaintext-bak"
      }
    }
  }
  ```

  While `__globalOptions__` is the global option, `encrypt` is the option for the sub-command `encrypt` and etc.
