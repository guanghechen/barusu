[![npm version](https://img.shields.io/npm/v/@barusu/util-blob.svg)](https://www.npmjs.com/package/@barusu/util-blob)
[![npm download](https://img.shields.io/npm/dm/@barusu/util-blob.svg)](https://www.npmjs.com/package/@barusu/util-blob)
[![npm license](https://img.shields.io/npm/l/@barusu/util-blob.svg)](https://www.npmjs.com/package/@barusu/util-blob)


# Usage

## Install
  ```shell
  yarn add --dev @barusu/util-blob
  ```

## Usage

  * `convertDataURLToBlob(dataURL: string): Blob`: Creates and returns a blob from a data URL (either base64 encoded or not).

  * `downloadBlob(blob: Blob, filename: string): void`: emit a download task in browser
