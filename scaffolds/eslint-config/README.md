[![npm version](https://img.shields.io/npm/v/@barusu/eslint-config.svg)](https://www.npmjs.com/package/@barusu/eslint-config)
[![npm download](https://img.shields.io/npm/dm/@barusu/eslint-config.svg)](https://www.npmjs.com/package/@barusu/eslint-config)
[![npm license](https://img.shields.io/npm/l/@barusu/eslint-config.svg)](https://www.npmjs.com/package/@barusu/eslint-config)


# Usage

  * Install
    ```shell
    yarn add --dev @barusu/eslint-config
    ```

  * Use in .eslint.rc
    ```javascript
    module.exports = {
      root: true,
      extends: [
        '@barusu/eslint-config'
      ],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json'
      },
      rules: {
      }
    }
    ```
