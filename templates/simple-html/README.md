[![npm version](https://img.shields.io/npm/v/@barusu/template-simple-html.svg)](https://www.npmjs.com/package/@barusu/template-simple-html)
[![npm download](https://img.shields.io/npm/dm/@barusu/template-simple-html.svg)](https://www.npmjs.com/package/@barusu/template-simple-html)
[![npm license](https://img.shields.io/npm/l/@barusu/template-simple-html.svg)](https://www.npmjs.com/package/@barusu/template-simple-html)


# Usage

  * Install
    ```shell
    yarn global add @barusu/template-simple-html
    ```

  * Create new html project
    ```shell
    barusu-template-simple-html new-html-project <project name>
    ```

  * Add new html page
    ```shell
    cd <project path>
    yarn add-page <page-name>
    ```

  * Start
    ```shell
    cd <project path>
    yarn start
    ```

  * Build
    ```shell
    cd <project path>
    yarn build
    ```

# Notice
  * Chrome should run in port 9222 to support debug
    - see https://github.com/Microsoft/vscode-chrome-debug#attach

  * Temporary file `.empty.__tmp__.js` will created, due to the rollup.Configuration.output cannot be empty. It is not recommended that you modify this path as this file is configured to be ignored both in `vscode` and `git`.
