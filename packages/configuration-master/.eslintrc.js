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
    '@typescript-eslint/explicit-module-boundary-types': 0,
  }
}
