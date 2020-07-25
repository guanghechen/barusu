const fs = require('fs-extra')
const path = require('path')
const semverRegex = require('semver-regex')
const manifest = require('./package.json')


module.exports = function (plop) {
  const cwd = path.resolve(process.cwd())
  const resolveSourcePath = (p) => path.normalize(path.resolve(__dirname, 'boilerplate/project-style', p))

  plop.setGenerator('new-simple-project', {
    description: 'create simple template html project',
    prompts: [
      {
        type: 'input',
        name: 'packageName',
        message: 'name',
        transform: (text) => text.trim(),
      },
      {
        type: 'input',
        name: 'packageAuthor',
        message: 'author',
        default: (answers) => {
          // detect package.json
          const packageJsonPath = path.resolve(cwd, 'package.json')
          if (fs.existsSync(packageJsonPath)) {
            const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8')
            const packageJson = JSON.parse(packageJsonContent)
            if (packageJson.author == null) return undefined
            if (typeof packageJson.author === 'string') return packageJson.author
            if (typeof packageJson.author.name === 'string') return packageJson.author.name
          }
          return undefined
        },
        transform: (text) => text.trim(),
      },
      {
        type: 'input',
        name: 'packageVersion',
        message: 'version',
        default: '0.0.0',
        transform: (text) => text.trim(),
        validate: (text) => semverRegex().test(text),
      },
      {
        type: 'input',
        name: 'packageLocation',
        message: ({ packageName }) => 'location of ' + packageName,
        default: (answers) => {
          // detect lerna
          if (fs.existsSync(path.resolve(cwd, 'lerna.json'))) {
            answers.isLernaProject = true
            answers.projectName = answers.packageName.startsWith('@')
              ? /^@([^\/]+)/.exec(answers.packageName)[1]
              : /^([^\-]+)/.exec(answers.packageName)[1]
            return 'packages/' + answers.packageName.replace(/^[^\/]+[\/]/, '')
          }
          answers.projectName = answers.packageName.replace(/^@/, '').replace('\/', '-')
          return answers.packageName.replace(/^@/, '')
        },
        transform: (text) => text.trim(),
      },
      {
        type: 'number',
        name: 'serverPort',
        default: 3030,
      }
    ],
    actions: function (answers) {
      answers.templateVersion = manifest.version
      answers.defaultPage = { name: 'Home', path: 'home' }
      const resolveTargetPath = (p) => path.normalize(path.resolve(answers.packageLocation, p))

      return [
        {
          type: 'add',
          path: resolveTargetPath('.editorconfig'),
          templateFile: resolveSourcePath('.editorconfig.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('.gitignore'),
          templateFile: resolveSourcePath('.gitignore.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('package.json'),
          templateFile: resolveSourcePath('package.json.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('rollup.config.js'),
          templateFile: resolveSourcePath('rollup.config.js.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('.vscode/launch.json'),
          templateFile: resolveSourcePath('.vscode/launch.json.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('.vscode/settings.json'),
          templateFile: resolveSourcePath('.vscode/settings.json.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/resources/script/third-party/moment.min.js'),
          templateFile: resolveSourcePath('src/resources/script/third-party/moment.min.js.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/resources/style/mixin.styl'),
          templateFile: resolveSourcePath('src/resources/style/mixin.styl.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/resources/style/main.styl'),
          templateFile: resolveSourcePath('src/resources/style/main.styl.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/resources/style/home.styl'),
          templateFile: resolveSourcePath('src/resources/style/home.styl.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/pages/index.pug'),
          templateFile: resolveSourcePath('src/pages/index.pug.hbs')
        },
      ].filter(Boolean)
    }
  })
}
