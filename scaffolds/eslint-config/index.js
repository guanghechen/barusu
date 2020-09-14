module.exports = {
  'extends': [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint'
  ],
  'parser': '@typescript-eslint/parser',
  'plugins': [
    '@typescript-eslint',
    'prettier'
  ],
  'settings': {
    'import/resolver': {
      'node': {
        'extensions': ['.js', '.ts']
      }
    }
  },
  'ignorePatterns': [
    '**/test/cases/**',
    '**/__test__/cases/**',
    '**/node_modules/**',
    '**/lib/**',
    '**/dist/**',
    '**/build/**',
    '**/target/**',
    '**/vendor/**',
    '**/release/**',
    '**/example/**',
    '**/demo/**',
    '**/doc/**',
    '**/tmp/**',
    '**/__tmp__/**',
    '**/script/**',
    '**/coverage/**',
    '**/*.styl.d.ts',
    '*.tsbuildinfo',
    'rollup.config.js',
    '.eslintrc.js'
  ],
  'rules': {
    'class-methods-use-this': 0,
    'func-call-spacing': ['error', 'never'],
    'func-names': 0,
    'key-spacing': ['error', { 'align': 'value' }],
    'lines-between-class-members': 0,
    'new-cap': ['error', { 'newIsCap': true, 'capIsNew': true }],
    'no-await-in-loop': 0,
    'no-bitwise': 0,
    'no-console': 0,
    'no-continue': 0,
    'no-cond-assign': ['error', 'always'],
    'no-inner-declarations': 'error',
    'no-mixed-operators': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-multi-spaces': ['error', { 'ignoreEOLComments': true }],
    'no-param-reassign': ['error', { 'props': true }],
    'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
    'no-restricted-syntax': 0,
    'no-return-assign': ['error', 'always'],
    'no-throw-literal': 0,
    'no-underscore-dangle': 0,
    'prefer-destructuring': 0,
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'space-before-blocks': [
      'error',
      {
        'functions': 'always',
        'keywords': 'always',
        'classes': 'always',
      }
    ],
    'space-before-function-paren': 0,
    'spaced-comment': ['error', 'always'],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': ['error', { 'int32Hint': false }],
    'space-unary-ops': ['error', { 'words': true, 'nonwords': false }],
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        'allowDestructuring': true, // Allow `const { props, state } = this`; false by default
        'allowedNames': ['self']    // Allow `const self = this`; `[]` by default
      }
    ],
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        'ignoreTypeReferences': true,
        'typedefs': false,
      }
    ],
    '@typescript-eslint/space-before-function-paren': [
      'error',
      {
        'named': 'never',
        'anonymous': 'always',
        'asyncArrow': 'always',
      }
    ],
  }
}
