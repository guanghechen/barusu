[![npm version](https://img.shields.io/npm/v/@barusu/blob-util.svg)](https://www.npmjs.com/package/@barusu/blob-util)
[![npm download](https://img.shields.io/npm/dm/@barusu/blob-util.svg)](https://www.npmjs.com/package/@barusu/blob-util)
[![npm license](https://img.shields.io/npm/l/@barusu/blob-util.svg)](https://www.npmjs.com/package/@barusu/blob-util)


# Usage

## Install
  ```shell
  yarn add --dev @barusu/blob-util
  ```

## Usage

  * `convertDataURLToBlob(dataURL: string): Blob`: Creates and returns a blob from a data URL (either base64 encoded or not).

  * `downloadBlob(blob: Blob, filename: string): void`: emit a download task in browser
