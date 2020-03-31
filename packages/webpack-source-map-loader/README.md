[![npm version](https://img.shields.io/npm/v/@barusu/webpack-source-map-loader.svg)](https://www.npmjs.com/package/@barusu/webpack-source-map-loader)
[![npm download](https://img.shields.io/npm/dm/@barusu/webpack-source-map-loader.svg)](https://www.npmjs.com/package/@barusu/webpack-source-map-loader)
[![npm license](https://img.shields.io/npm/l/@barusu/webpack-source-map-loader.svg)](https://www.npmjs.com/package/@barusu/webpack-source-map-loader)


# Usage

## Install
```shell
yarn add --dev @barusu/webpack-source-map-loader
```

## Use in webpack

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

# Why

 It seems that [source-map-loader](https://github.com/webpack-contrib/source-map-loader) is no longer maintained, but there still some problems when you are using lerna to structure your project:

  * Relative path used by sourcemap in package in monorepo cannot be parsed correctly in other packages
    - see [Load all sources without sourceContent and resolve relative sources with context](https://github.com/webpack-contrib/source-map-loader/pull/91)
