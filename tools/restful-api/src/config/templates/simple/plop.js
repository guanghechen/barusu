// eslint-disable-next-line import/no-extraneous-dependencies
const manifest = require('@barusu/tool-restful-api/package.json')
const path = require('path')

module.exports = function (plop) {
  plop.setGenerator('mock-server', {
    description: 'create mock server',
    prompts: [
      {
        type: 'input',
        name: 'packageName',
        default: path.basename(path.resolve()),
        message: 'package name',
        transform: text => text.trim(),
      },
      {
        type: 'input',
        name: 'encoding',
        default: 'utf-8',
        message: 'encoding',
        transform: text => text.trim(),
      },
      {
        type: 'list',
        name: 'logLevel',
        default: 'verbose',
        message: 'log level',
        choices: ['debug', 'verbose', 'info', 'warn', 'error'],
        filter: text => text.toLowerCase().trim(),
        transformer: text => text.toLowerCase().trim(),
      },
    ],
    actions: function (answers) {
      // eslint-disable-next-line no-param-reassign
      answers.templateVersion = manifest.version

      const workspace = answers.workspace || path.resolve()
      const resolveSourcePath = p => path.normalize(path.resolve(__dirname, p))
      const resolveTargetPath = p => path.normalize(path.resolve(workspace, p))

      return [
        {
          type: 'add',
          path: resolveTargetPath('.vscode/settings.json'),
          templateFile: resolveSourcePath('.vscode/settings.json.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('script/serve.ts'),
          templateFile: resolveSourcePath('script/serve.ts.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/model/core/response.ts'),
          templateFile: resolveSourcePath('src/model/core/response.ts.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/model/model/user.ts'),
          templateFile: resolveSourcePath('src/model/model/user.ts.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/model/model/book.ts'),
          templateFile: resolveSourcePath('src/model/model/book.ts.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/model/vo/user.ts'),
          templateFile: resolveSourcePath('src/model/vo/user.ts.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/model/vo/book.ts'),
          templateFile: resolveSourcePath('src/model/vo/book.ts.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.editorconfig'),
          templateFile: resolveSourcePath('.editorconfig.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.eslintrc.js'),
          templateFile: resolveSourcePath('.eslintrc.js.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.gitignore'),
          templateFile: resolveSourcePath('.gitignore.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('api.yml'),
          templateFile: resolveSourcePath('api.yml.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('app.yml'),
          templateFile: resolveSourcePath('app.yml.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('ecosystem.config.js'),
          templateFile: resolveSourcePath('ecosystem.config.js.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('nodemon.json'),
          templateFile: resolveSourcePath('nodemon.json.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('package.json'),
          templateFile: resolveSourcePath('package.json.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('tsconfig.json'),
          templateFile: resolveSourcePath('tsconfig.json.hbs'),
        },
      ]
    },
  })
}
