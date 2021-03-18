<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/barusu#readme">Barusu</a>
  </h1>
  <div align="center">
    <a href="#license">
      <img
        alt="License"
        src="https://img.shields.io/github/license/guanghechen/barusu"
      />
    </a>
    <a href="https://github.com/guanghechen/barusu/tags">
      <img
        alt="Package Version"
        src="https://img.shields.io/github/v/tag/guanghechen/barusu?include_prereleases&sort=semver"
      />
    </a>
    <a href="https://github.com/guanghechen/barusu/search?l=typescript">
      <img
        alt="Github Top Language"
        src="https://img.shields.io/github/languages/top/guanghechen/barusu"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@barusu/chalk-logger"
      />
    </a>
    <a href="https://github.com/facebook/jest">
      <img
        alt="Tested with Jest"
        src="https://img.shields.io/badge/tested_with-jest-9c465e.svg"
      />
    </a>
    <a href="https://github.com/prettier/prettier">
      <img
        alt="Code Style: prettier"
        src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"
      />
    </a>
  </div>
</header>
<br/>


A monorepo for maintaining multiple typescript projects.

## Overview


### Scaffolds

Scaffolds are some development scripts.

   Package                                | Status        | Description
  :--------------------------------------:|:-------------:|:--------------------------------------
   [@barusu/webpack-source-map-loader][]  | Not Recommend | Webpack plugin for loading source map.

[@barusu/webpack-source-map-loader]: https://github.com/guanghechen/barusu/tree/master/scaffolds/webpack-source-map-loader#readme


### Templates

Templates are some boilerplates for fast creating various projects.

   Package                                | Status        | Description
  :--------------------------------------:|:-------------:|:--------------------------------------
   [@barusu/template-simple-html][]       | Not Recommend | Boilerplates to create a simple traditional html project.

[@barusu/template-simple-html]: https://github.com/guanghechen/barusu/tree/master/scaffolds/template-simple-hml#readme

### Tools

  Tools are some command line programs in node.js

   Package                                | Status        | Description
  :--------------------------------------:|:-------------:|:--------------------------------------
   [@barusu/tool-find-inconsistent][]     | Active        | Find inconsistent package versions in monorepo.
   [@barusu/tool-git-cipher][]            | Active        | Cipher git repository.
   [@barusu/tool-restful-api][]           | Active        | Quickly create restful style mock server.
   [@barusu/tool-tsconfig-paths][]        | Not Recommend | Expand path alias to full path of declaration files which bundled by tsc.
   [@barusu/tool-word][]                  | Not Recommend | Count the frequency of characters in the file(s).

[@barusu/tool-find-inconsistent]: https://github.com/guanghechen/barusu/tree/master/tools/find-inconsistent#readme
[@barusu/tool-git-cipher]: https://github.com/guanghechen/barusu/tree/master/tools/git-cipher#readme
[@barusu/tool-restful-api]: https://github.com/guanghechen/barusu/tree/master/tools/restful-api#readme
[@barusu/tool-tsconfig-paths]: https://github.com/guanghechen/barusu/tree/master/tools/tsconfig-paths#readme
[@barusu/tool-word]: https://github.com/guanghechen/barusu/tree/master/tools/word#readme

### Utils

  Utils are some utility function collections.

   Package                                | Status        | Description
  :--------------------------------------:|:-------------:|:--------------------------------------
   [@barusu/util-blob][]                  | Active        | Blob object helpers.
   [@barusu/util-cli][]                   | Active        | Helpers for creating Node.js cli program.
   [@barusu/util-jest][]                  | Active        | Jest utility functions.
   [@barusu/util-mocha][]                 | Not Recommend | Mocha utility functions.

[@barusu/util-blob]: https://github.com/guanghechen/barusu/tree/master/utils/blob#readme
[@barusu/util-cli]: https://github.com/guanghechen/barusu/tree/master/utils/cli#readme
[@barusu/util-jest]: https://github.com/guanghechen/barusu/tree/master/utils/jest#readme
[@barusu/util-mocha]: https://github.com/guanghechen/barusu/tree/master/utils/mocha#readme

### Other projects

   Package                                | Status        | Description
  :--------------------------------------:|:-------------:|:--------------------------------------
   [@barusu/chalk-logger][]               | Active        | A simple colorful logger.
   [@barusu/event-bus][]                  | Not Recommend | Simple event bus.
   [@barusu/redux-actions][]              | Active        | Helpers for redux actions.
   [@barusu/typescript-json-schema][]     | Active        | Convert typescript interfaces to JSON-Schema.

[@barusu/chalk-logger]: https://github.com/guanghechen/barusu/tree/master/packages/chalk-logger#readme
[@barusu/event-bus]: https://github.com/guanghechen/barusu/tree/master/packages/event-bus#readme
[@barusu/redux-actions]: https://github.com/guanghechen/barusu/tree/master/packages/redux-actions#readme
[@barusu/typescript-json-schema]: https://github.com/guanghechen/barusu/tree/master/packages/typescript-json-schema#readme
