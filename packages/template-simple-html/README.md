<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/barusu/tree/main/packages/template-simple-hml#readme">@barusu/template-simple-html</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@barusu/template-simple-html">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@barusu/template-simple-html.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/template-simple-html">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@barusu/template-simple-html.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/template-simple-html">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@barusu/template-simple-html.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@barusu/template-simple-html"
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
  npm install -g @barusu/template-simple-html
  ```

* yarn

  ```bash
  yarn global add @barusu/template-simple-html
  ```

## Usage

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

## Notice

  * Chrome should run in port 9222 to support debug
    - see https://github.com/Microsoft/vscode-chrome-debug#attach

  * Temporary file `.empty.__tmp__.js` will created, due to the rollup.Configuration.output cannot be empty. It is not recommended that you modify this path as this file is configured to be ignored both in `vscode` and `git`.
