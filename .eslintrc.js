module.exports = {
  extends: ['@barusu/eslint-config'],
  rules: {
    'no-prototype-builtins': 0,
  },
  ignorePatterns: [
    '**/__test__/cases/',
    'typescript-json-schema/test/programs/',
  ],
}
