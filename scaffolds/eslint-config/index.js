const customRules = require('./rule-custom')
const reactAppRules = require('./rule-react-app')

module.exports = {
  root: true,
  env: { browser: true, commonjs: true, es6: true, jest: true, node: true },
  globals: { Atomics: 'readonly', SharedArrayBuffer: 'readonly' },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['import', 'prettier'],
  rules: {
    ...reactAppRules.jsRules,
    ...customRules.jsRules,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'prettier',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',

        // typescript-eslint specific options
        warnOnUnsupportedTypeScriptVersion: true,
        allowImportExportEverywhere: true,
      },
      plugins: ['import', 'prettier', '@typescript-eslint'],
      rules: {
        ...reactAppRules.tsRules,
        ...customRules.tsRules,
      },
    },
  ],
}
