[![npm version](https://img.shields.io/npm/v/@barusu/tool-git-cipher.svg)](https://www.npmjs.com/package/@barusu/tool-git-cipher)
[![npm download](https://img.shields.io/npm/dm/@barusu/tool-git-cipher.svg)](https://www.npmjs.com/package/@barusu/tool-git-cipher)
[![npm license](https://img.shields.io/npm/l/@barusu/tool-git-cipher.svg)](https://www.npmjs.com/package/@barusu/tool-git-cipher)


Encrypt the working directory (Default algorithm: `AES-256 gcm`).


# Usage

  * Install
    ```shell
    yarn add --dev @barusu/tool-git-cipher
    ```

  * init
    ```shell
    barusu-git-cipher init <dir>
    ```

  * encrypt
    ```shell
    barusu-git-cipher encrypt <dir>
    ```

  * decrypt
    ```shell
    barusu-git-cipher decrypt <dir>
    ```


# Options

## Overview

  ```shell
  ```

## init

  ```shell
  ```

## encrypt

  ```shell
  ```

## decrypt

  ```shell
  ```


# Demo
  You can specify configs into `package.json` like below:

  ```json
  {
    "@barusu/tool-git-cipher": {
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
