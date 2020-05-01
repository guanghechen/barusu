const fs = require('fs-extra')
const path = require('path')
const semverRegex = require('semver-regex')
const manifest = require('./package.json')


module.exports = function (plop) {
  const cwd = path.resolve(process.cwd())

  // create actions to add a new page
  const createAddPageActions = (resolveSourcePath, resolveTargetPath, pagePath) => {
    return [
      {
        type: 'add',
        path: resolveTargetPath(`src/${ pagePath }/index.pug`),
        templateFile: resolveSourcePath(`src/page/index.pug.hbs`)
      },
      {
        type: 'add',
        path: resolveTargetPath(`src/${ pagePath }/style/main.styl`),
        templateFile: resolveSourcePath(`src/page/style/main.styl.hbs`)
      },
      {
        type: 'add',
        path: resolveTargetPath(`src/${ pagePath }/script/main.js`),
        templateFile: resolveSourcePath(`src/page/script/main.js.hbs`)
      },
      {
        type: 'add',
        path: resolveTargetPath(`src/${ pagePath }/script/util.js`),
        templateFile: resolveSourcePath(`src/page/script/util.js.hbs`)
      },
    ]
  }

  plop.setGenerator('new-html-project', {
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
      const resolveSourcePath = (p) => path.normalize(path.resolve(__dirname, 'boilerplate', p))
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
          path: resolveTargetPath('src/_shared/script/third-party/axios.min.js'),
          templateFile: resolveSourcePath('src/_shared/script/third-party/axios.min.js.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/_shared/script/third-party/moment.min.js'),
          templateFile: resolveSourcePath('src/_shared/script/third-party/moment.min.js.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/_shared/script/util/requester.js'),
          templateFile: resolveSourcePath('src/_shared/script/util/requester.js.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/_shared/script/util/task.js'),
          templateFile: resolveSourcePath('src/_shared/script/util/task.js.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/_shared/script/main.js'),
          templateFile: resolveSourcePath('src/_shared/script/main.js.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/_shared/style/mixin.styl'),
          templateFile: resolveSourcePath('src/_shared/style/mixin.styl.hbs')
        },
        {
          type: 'add',
          path: resolveTargetPath('src/_shared/style/main.styl'),
          templateFile: resolveSourcePath('src/_shared/style/main.styl.hbs')
        },
        ...createAddPageActions(resolveSourcePath, resolveTargetPath, answers.defaultPage.path)
      ].filter(Boolean)
    }
  })

  plop.setGenerator('add-html-page', {
    description: 'create new page',
    prompts: [
      {
        type: 'input',
        name: 'packageLocation',
        message: 'package location',
        default: path.resolve(),
        transform: (text) => text.trim(),
      },
      {
        type: 'input',
        name: 'pageName',
        message: 'page name',
        transform: (text) => text.trim(),
      },
      {
        type: 'input',
        name: 'pagePath',
        message: 'page path',
        default: (answers) => answers.pageName.toLowerCase().split(/\n+/).join('-'),
        transform: (text) => text.trim(),
      },
    ],
    actions: function (answers) {
      // update rollup.config.js
      const rollupConfigPath = path.resolve(answers.packageLocation, 'rollup.config.js')
      if (fs.existsSync(rollupConfigPath)) {
        const encoding = 'utf-8'
        let content = fs.readFileSync(rollupConfigPath, encoding)
        content = content.replace(/\n([^\S\n]+)const\s+pages\s*=\s*(\[\n+\s+[^\]]+\])/, (m, p1, p2) => {
          let pages = null
          try {
            pages = eval(p2)
          } catch (error) {
            return m
          }

          const item = {
            name: answers.pageName,
            srcPath: answers.pagePath,
            dstPath: answers.pagePath,
          }

          // check if it's duplicated
          const existedOne = pages.find(x => (
            x.name === item.name
            && x.srcPath === item.srcPath
            && x.dstPath === item.dstPath
          ))
          if (existedOne != null) return m

          pages.push(item)
          pages = pages
            .map(d => {
              let s = '  {'
              for (const [key, val] of Object.entries(d)) {
                s += ` ${ key }: '${ val }',`
              }
              return p1 + s.replace(/,$/, '') + ' }'
            })
            .join(',\n')
          return '\n' + p1 + 'const pages = [\n' + pages + '\n' + p1 + ']'
        })
        fs.writeFileSync(rollupConfigPath, content, encoding)
      }

      const resolveSourcePath = (p) => path.normalize(path.resolve(__dirname, 'boilerplate', p))
      const resolveTargetPath = (p) => path.normalize(path.resolve(answers.packageLocation, p))
      return [
        ...createAddPageActions(resolveSourcePath, resolveTargetPath, answers.pagePath)
      ]
    }
  })
}
