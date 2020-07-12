# v0.0.18 (2020-07-09)
* Support watch mode
* Update signature of `Options.transform`

  ```typescript
  transform?: ( content: string | ArrayBuffer) => Promise<string | ArrayBuffer
  ```

  to

  ```typescript
  transform?: (
    content: string | ArrayBuffer,
    srcPath: string,
    dstPath: string
  ) => Promise<string | ArrayBuffer`
  ```
