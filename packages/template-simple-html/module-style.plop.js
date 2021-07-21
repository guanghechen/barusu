const { toTitleCase } = require('@guanghechen/option-helper')
const {
  resolveNpmPackageAnswers,
  createNpmPackagePrompts,
} = require('@guanghechen/plop-helper')
const fs = require('fs-extra')
const path = require('path')
const manifest = require('./package.json')

module.exports = function (plop) {
  const cwd = path.resolve(process.cwd())
  const resolveSourcePath = p =>
    path.normalize(path.resolve(__dirname, 'boilerplate/module-style', p))

  // create actions to add a new page
  const createAddPageActions = (resolveTargetPath, pagePath) => {
    return [
      {
        type: 'add',
        path: resolveTargetPath(`src/${pagePath}/index.pug`),
        templateFile: resolveSourcePath('src/page/index.pug.hbs'),
      },
      {
        type: 'add',
        path: resolveTargetPath(`src/${pagePath}/style/main.styl`),
        templateFile: resolveSourcePath('src/page/style/main.styl.hbs'),
      },
      {
        type: 'add',
        path: resolveTargetPath(`src/${pagePath}/script/main.js`),
        templateFile: resolveSourcePath('src/page/script/main.js.hbs'),
      },
      {
        type: 'add',
        path: resolveTargetPath(`src/${pagePath}/script/util.js`),
        templateFile: resolveSourcePath('src/page/script/util.js.hbs'),
      },
    ]
  }

  plop.setGenerator('new-module-style-project', {
    description: 'create simple template html project (module style)',
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
            'src/_shared/script/third-party/axios.min.js',
          ),
          templateFile: resolveSourcePath(
            'src/_shared/script/third-party/axios.min.js.hbs',
          ),
        },
        {
          type: 'add',
          path: resolveTargetPath(
            'src/_shared/script/third-party/moment.min.js',
          ),
          templateFile: resolveSourcePath(
            'src/_shared/script/third-party/moment.min.js.hbs',
          ),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/_shared/script/util/requester.js'),
          templateFile: resolveSourcePath(
            'src/_shared/script/util/requester.js.hbs',
          ),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/_shared/script/util/task.js'),
          templateFile: resolveSourcePath(
            'src/_shared/script/util/task.js.hbs',
          ),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/_shared/script/main.js'),
          templateFile: resolveSourcePath('src/_shared/script/main.js.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/_shared/style/mixin.styl'),
          templateFile: resolveSourcePath('src/_shared/style/mixin.styl.hbs'),
        },
        {
          type: 'add',
          path: resolveTargetPath('src/_shared/style/main.styl'),
          templateFile: resolveSourcePath('src/_shared/style/main.styl.hbs'),
        },
        ...createAddPageActions(resolveTargetPath, answers.defaultPage.path),
      ].filter(Boolean)
    },
  })

  plop.setGenerator('add-isolate-page', {
    description: 'create new page',
    prompts: [
      {
        type: 'input',
        name: 'packageLocation',
        message: 'package location',
        default: path.resolve(),
        transform: text => text.trim(),
      },
      {
        type: 'input',
        name: 'pageName',
        message: 'page name',
        transform: text => text.trim(),
      },
      {
        type: 'input',
        name: 'pagePath',
        message: 'page path',
        default: answers =>
          answers.pageName.toLowerCase().split(/\n+/).join('-'),
        transform: text => text.trim(),
      },
    ],
    actions: function (answers) {
      // update rollup.config.js
      const rollupConfigPath = path.resolve(
        answers.packageLocation,
        'rollup.config.js',
      )
      if (fs.existsSync(rollupConfigPath)) {
        const encoding = 'utf-8'
        let content = fs.readFileSync(rollupConfigPath, encoding)
        content = content.replace(
          /\n([^\S\n]+)const\s+pages\s*=\s*(\[\n+\s+[^\]]+\])/,
          (m, p1, p2) => {
            let pages = null
            try {
              // eslint-disable-next-line no-eval
              pages = eval(p2)
            } catch (error) {
              return m
            }

            const item = {
              name: toTitleCase(answers.pageName),
              srcPath: answers.pagePath,
              dstPath: answers.pagePath,
            }

            // check if it's duplicated
            const existedOne = pages.find(
              x =>
                x.name === item.name &&
                x.srcPath === item.srcPath &&
                x.dstPath === item.dstPath,
            )
            if (existedOne != null) return m

            pages.push(item)
            pages = pages
              .map(d => {
                let s = '  {'
                for (const [key, val] of Object.entries(d)) {
                  s += ` ${key}: '${val}',`
                }
                return p1 + s.replace(/,$/, '') + ' }'
              })
              .join(',\n')
            return '\n' + p1 + 'const pages = [\n' + pages + '\n' + p1 + ']'
          },
        )
        fs.writeFileSync(rollupConfigPath, content, encoding)
      }

      const resolveTargetPath = p =>
        path.normalize(path.resolve(answers.packageLocation, p))
      return [...createAddPageActions(resolveTargetPath, answers.pagePath)]
    },
  })
}
