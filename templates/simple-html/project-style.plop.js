const {
  resolveNpmPackageAnswers,
  createNpmPackagePrompts,
} = require('@guanghechen/plop-helper')
const path = require('path')
const manifest = require('./package.json')

module.exports = function (plop) {
  const cwd = path.resolve(process.cwd())
  const resolveSourcePath = p =>
    path.normalize(path.resolve(__dirname, 'boilerplate/project-style', p))

  plop.setGenerator('new-simple-project', {
    description: 'create simple template html project',
    prompts: [
      ...createNpmPackagePrompts(cwd, { packageVersion: '0.0.0' }),
      {
        type: 'number',
        name: 'serverPort',
        default: 3030,
      },
    ],
    actions: function (_answers) {
      const answers = resolveNpmPackageAnswers(_answers)
      answers.templateVersion = manifest.version
      answers.defaultPage = { name: 'Home', path: 'home' }

      const resolveTargetPath = p =>
        path.normalize(path.resolve(answers.packageLocation, p))

      // Assign resolved data into plop templates.
      Object.assign(_answers, answers)

      return [
        {
          type: 'add',
          path: resolveTargetPath('.babelrc'),
          templateFile: resolveSourcePath('.babelrc.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.browserslistrc'),
          templateFile: resolveSourcePath('.browserslistrc.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.editorconfig'),
          templateFile: resolveSourcePath('.editorconfig.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.gitignore'),
          templateFile: resolveSourcePath('.gitignore.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('package.json'),
          templateFile: resolveSourcePath('package.json.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('rollup.config.js'),
          templateFile: resolveSourcePath('rollup.config.js.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.vscode/launch.json'),
          templateFile: resolveSourcePath('.vscode/launch.json.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('.vscode/settings.json'),
          templateFile: resolveSourcePath('.vscode/settings.json.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath(
            'src/resources/script/third-party/moment.min.js',
          ),
          templateFile: resolveSourcePath(
            'src/resources/script/third-party/moment.min.js.hbs',
          ),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/resources/style/mixin.styl'),
          templateFile: resolveSourcePath('src/resources/style/mixin.styl.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/resources/style/main.styl'),
          templateFile: resolveSourcePath('src/resources/style/main.styl.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/resources/style/home.styl'),
          templateFile: resolveSourcePath('src/resources/style/home.styl.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/pages/index.pug'),
          templateFile: resolveSourcePath('src/pages/index.pug.hbs'),
        },
      ].filter(Boolean)
    },
  })
}
