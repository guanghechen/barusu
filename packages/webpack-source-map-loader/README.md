<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/barusu/tree/main/packages/webpack-source-map-loader#readme">@barusu/webpack-source-map-loader</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@barusu/webpack-source-map-loader">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@barusu/webpack-source-map-loader.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/webpack-source-map-loader">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@barusu/webpack-source-map-loader.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/webpack-source-map-loader">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@barusu/webpack-source-map-loader.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@barusu/webpack-source-map-loader"
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


## Install

* npm

  ```bash
  npm install --save-dev @barusu/webpack-source-map-loader
  ```

* yarn

  ```bash
  yarn add --dev @barusu/webpack-source-map-loader
  ```

## Usage

* Used in webpack:

  ```javascript
  module.exports = {
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ['@barusu/webpack-source-map-loader'],
          enforce: "pre"
        }
      ]
    }
  };
  ```

## Why

 It seems that [source-map-loader](https://github.com/webpack-contrib/source-map-loader) is no longer maintained, but there still some problems when you are using lerna to structure your project:

  * Relative path used by sourcemap in package in monorepo cannot be parsed correctly in other packages
    - see [Load all sources without sourceContent and resolve relative sources with context](https://github.com/webpack-contrib/source-map-loader/pull/91)
