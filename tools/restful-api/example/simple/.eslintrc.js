module.exports = {
  root: true,
  extends: [
    '@barusu/eslint-config'
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json'
  },
  ignorePatterns: [
    'ecosystem.config.js',
  ],
  rules: {
  },
}
