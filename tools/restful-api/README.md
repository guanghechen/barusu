<header>
  <h1 align="center">
    <a href="https://github.com/guanghechen/barusu/tree/main/tools/restful-apil#readme">@barusu/tool-restful-api</a>
  </h1>
  <div align="center">
    <a href="https://www.npmjs.com/package/@barusu/tool-restful-api">
      <img
        alt="Npm Version"
        src="https://img.shields.io/npm/v/@barusu/tool-restful-api.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/tool-restful-api">
      <img
        alt="Npm Download"
        src="https://img.shields.io/npm/dm/@barusu/tool-restful-api.svg"
      />
    </a>
    <a href="https://www.npmjs.com/package/@barusu/tool-restful-api">
      <img
        alt="Npm License"
        src="https://img.shields.io/npm/l/@barusu/tool-restful-api.svg"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@barusu/tool-restful-api"
      />
    </a>
    <a href="https://github.com/tj/commander.js/">
      <img
        alt="React version"
        src="https://img.shields.io/npm/dependency-version/@barusu/tool-restful-api/commander"
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


# Introduction
  * In brief, the purpose of this project is to achieve: `ts type` -> `JSON-Schema` -> `mock data` -> `restful mock-server`
    - `ts type -> JSON-Schema`: That is, the types defined using typescript are converted to [JSON-Schema][json-schema], see [typescript-json-schema][]

    - `JSON-SCHEMA -> mock-data`: That is to generate mock data through `json-schema`, see [json-schema-faker][]

    - `mock-data -> mock-server`: That is, define the relationship between the model (JSON-Schema or ts type) and the API is in some configuration files, and through these configurations to generate a restful-style mock server

  * This tool provides three sub-commands: `init`, `generate` and `serve`
    - The `init` sub-command generates a template project, changes the configuration and adding or deleting models as needed to quickly generate a mock server

    - The `generate` sub-command parses the configuration file and generates a JSON-Schema for the specified model. You can copy the JSON-Schema into a platform similar to `yapi` which support importing JSON-Schema to quickly define the request or response models in the API page.

    - The `serve` sub-command parses the configuration file to generate a mock server
      - You can specify the directory of the mock data file, so that the files under this file directory are preferentially proxyed as the response data;
      - In addition, `serve` also supports custom routing, which is based on `koa` and `@koa/router`. If you want to support custom routing while generating mock server, see below

  ---

  * 简单地来说，这个工程的目的是实现：`ts 类型` --> `JSON-Schema` --> `mock data` --> `restful mock-server`
    - `ts 类型 --> JSON-Schema`: 即把 ts 定义的类型转为 [JSON-Schema][json-schema]，可见 [typescript-json-schema][]

    - `JSON-SCHEMA --> mock-data`: 即通过 `json-schema` 生成 mock 数据，可见 [json-schema-faker][]

    - `mock-data --> mock-server`: 即通过配置文件定义模型（JSON-Schema 或 ts 类型）和 api 的关系，以生成 restful 风格的 mock 服务器

  * 该工具提供了三个子命令：`init`、`generate` 和 `serve`
    - `init` 子命令生成一个模板工程，按需更改配置和增添模型，以快速生成 mock server

    - `generate` 子命令解析配置文件，将指定的模型生成 JSON-Schema，你可以将该 JSON-Schema 拷贝进类似 `yapi` 的支持导入 JSON-Schema 的平台中，即可快速定义接口文档中的请求/响应对象

    - `serve` 子命令解析配置文件，生成一个 mock server
      - 你可以指定 mock data 文件的目录，使得优先代理此文件目录下的文件作为响应数据；
      - 此外，`serve` 还支持自定义路由，它基于 `koa` 和 `@koa/router`，如果你想要在生成 mock server 的同时还支持自定义路由的话，可参见下文

## Install

  ```bash
  npm install -g @barusu/tool-restful-api
  ```

* yarn

  ```bash
  yarn global add @barusu/tool-restful-api
  ```

## Cli Usage

  ```shell
  # Init mock server project
  $ barusu-rapit init demo-mock-server --log-level verbose

  # # or use with npx
  # $ npx @barusu/tool-restful-api init demo-mock-server -- --log-level verbose

  $ cd demo-mock-server
  $ yarn serve:cli
  ```

### help

  ```shell
  $ barusu-rapit --help
  Usage: barusu-rapit [options] [command]

  Options:
    -V, --version                                     output the version number
    --log-level <level>                               specify logger's level.
    --log-name <name>                                 specify logger's name.
    --log-mode <'normal' | 'loose'>                   specify logger's name.
    --log-flag <option>                               specify logger' option. [[no-]<date|colorful|inline>] (default: [])
    --log-output <filepath>                           specify logger' output path.
    --log-encoding <encoding>                         specify output file encoding.
    -c, --config-path <configFilepath>                config filepaths (default: [])
    --parastic-config-path <parasticConfigFilepath>   parastic config filepath
    --parastic-config-entry <parasticConfigFilepath>  parastic config filepath
    -h, --help                                        display help for command

  Commands:
    init|i <workspace>
    generate|g [options] <workspace>
    serve|s [options] <workspace>
    help [command]                                    display help for command
  ```
### init
  ```shell
  $ barusu-rapit init --help
  Usage: barusu-rapit init|i [options] <workspace>

  Options:
    -h, --help  display help for command
  ```

### generate
  ```shell
  $ barusu-rapit generate --help
  Usage: barusu-rapit generate|g [options] <workspace>

  Options:
    -C, --api-config-path <api-config-path>  filepath of api-item config (glob patterns / strings) (default: [])
    -s, --schema-root-path <schemaRootPath>  root path of schema files
    --mute-missing-model                     quiet when model not found
    --clean                                  clean schema folders before generate.
    -h, --help                               display help for command
  ```

### serve
  ```shell
  $ barusu-rapit serve --help
  Usage: barusu-rapit serve|s [options] <workspace>

  Options:
    -C, --api-config-path <api-config-path>              filepath of api-item config (glob patterns / strings) (default: [])
    -s, --schema-root-path <schemaRootPath>              root path of schema files
    -h, --host <host>                                    specify the ip/domain address to which the mock-server listens.
    -p, --port <port>                                    specify the port on which the mock-server listens.
    --prefix-url <prefixUrl>                             specify the prefix url of routes.
    --mock-required-only                                 json-schema-faker's option `requiredOnly`
    --mock-optionals-always                              json-schema-faker's option `alwaysFakeOptionals`
    --mock-optionals-probability <optionalsProbability>  json-schema-faker's option `optionalsProbability`
    --mock-data-prefix-url <mockDataPrefixUrl>           base url of mock data files
    --mock-data-root-dir <mockDataRootDir>               specify the root dirpath of mock data files
    --mock-resource-prefix-url <mockResourcePrefixUrl>   base url of resource files
    --mock-resource-root-dir <mockResourceRootDir>       specify the root dirpath of resource files
    --help                                               display help for command
  ```

  * If `mockDataRootDir` is specified, and the http verb of the current request is recorded as `httpMethod` and the url path is recorded as `httpPath` (not including `prefixUrl`), the following mock data path will be tried:
    - `<httpPath>__<httpMethod>`
    - `<httpPath>__<httpMethod>.json`
    - `<httpPath>`
    - `<httpPath>.json`

## Programming Usage
  ```shell
  yarn add --dev @barusu/tool-restful-api
  # or use npm: npm install --save-dev @barusu/tool-restful-api
  ```

  * Omit files defined in [Demo][demo]...

  * create a script file named `script/server.ts`, and add content like this:
    ```typescript
    import path from 'path'
    import chalk from 'chalk'
    import Router from '@koa/router'
    import {
      COMMAND_NAME,
      RestfulApiServeContext,
      RestfulApiServeProcessor,
      SubCommandServeOptions,
      createProgram,
      createRestfulApiServeContextFromOptions,
      createSubCommandServe,
    } from '@barusu/tool-restful-api'

    async function serve () {
      const program = createProgram()
      const promise = new Promise<RestfulApiServeContext>(resolve => {
        program.addCommand(createSubCommandServe(
          async (options: SubCommandServeOptions): Promise<void> => {
            const context: RestfulApiServeContext =
              await createRestfulApiServeContextFromOptions(options)
            resolve(context)
          }
        ))
      })

      const projectDir = path.resolve()
      const args = [
        '',
        COMMAND_NAME,
        'serve',
        projectDir,
        '--config-path',
        'app.yml',
      ]
      console.log(chalk.gray('--> ' + args.join(' ')))
      program.parse(args)

      const context = await promise
      const processor = new RestfulApiServeProcessor(context)

      const router = new Router()
      router.get('/hello/world', ctx => {
        // eslint-disable-next-line no-param-reassign
        ctx.body = {
          code: 200,
          message: 'Got it!',
        }
      })
      processor.registerRouter(router)

      processor.start()
    }

    serve()
    ```

  * Here we customize a route `GET /{context.prefixUrl}/hello/world`, combined with the definition in [Demo][demo], where the value of `context.prefixUrl` is `/mock`, so the route path is `/mock/hello/world`

  * run the command `node -r ts-node/register script/serve.ts` to start the mock server, and the custom route `GET /mock/hello/world` also will be registered in the server

## Examples

  * Create an empty ts project

  * Add a `tsconfig.json` file (you can specify other paths through `-p, --tsconfig-path <tsconfig-path>` in the sub-command `generate`), as follows

    ```json
    {
      "compilerOptions": {
        "allowSyntheticDefaultImports": true,
        "alwaysStrict": true,
        "declaration": true,
        "declarationMap": true,
        "downlevelIteration": true,
        "esModuleInterop": true,
        "experimentalDecorators": true,
        "forceConsistentCasingInFileNames": true,
        "moduleResolution": "node",
        "newLine": "LF",
        "noEmit": false,
        "noEmitOnError": true,
        "noImplicitAny": true,
        "noImplicitReturns": false,
        "noImplicitThis": true,
        "noImplicitUseStrict": false,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "pretty": false,
        "removeComments": false,
        "resolveJsonModule": true,
        "sourceMap": true,
        "strict": true,
        "strictFunctionTypes": true,
        "strictNullChecks": true,
        "strictPropertyInitialization": true,
        "suppressImplicitAnyIndexErrors": true
      },
      "include": [
        "src",
        "script"
      ]
    }
    ```

  * Add a `package.json` file, like this:

    ```json
    {
      "name": "restful-api---demo",
      "version": "0.0.0",
      "private": true,
      "scripts": {
        "build:schemas": "barusu-rapit generate . -c app.yml",
        "serve:cli": "nodemon --exec \"yarn build:schemas && barusu-rapit serve . -c app.yml\"",
        "serve:program": "nodemon --exec \"yarn build:schemas && node -r ts-node/register script/serve.ts\"",
        "serve": "yarn serve:program"
      },
      "dependencies": {
        "@barusu/tool-restful-api": "^0.0.27"
      },
      "devDependencies": {
        "nodemon": "^1.19.1",
        "ts-node": "^9.1.1",
        "typescript": "^4.2.3"
      }
    }
    ```

  * Add a project configuration file named `app.yml` (other paths can be used, but the command-line option `-c, --config-path <config-path>` needs to be used to specify the path of the custom project configuration file), the content is as follows:

    ```yaml
    __globalOptions__:
      encoding: utf-8
      logLevel: verbose
      schemaRootPath: data/schemas
      apiConfigPath:
        - api.yml

    # options for sub-command `generate`
    generate:
      clean: true
      muteMissingModel: true
      ignoredDataTypes:
        - 'undefined'
      additionalSchemaArgs:
        ref: false
        required: true

    # options for sub-command `serve`
    serve:
      host: '0.0.0.0'
      port: 8091
      prefixUrl: /mock
      schemaRootPath: data/schema
      mockDataFileFirst: true
      mockDataRootDir: data/
      mockOptionalsAlways: true
      mockOptionalsProbability: 0.7
    ```

    - Here we specify the `generate` and` serve` command options. Please note that command line parameters can override the values of these options.

    - For more configuration details, see the option interface: [SubCommandGenerateOptions][generate-command] and [SubCommandServeOptions][serve-command].

  * Add a configuration file `api.yml` that defines the API routes (you can specify other paths through the `-f, --api-config-path <api-config-path>`option), the content is like:

    ```yaml
    api:
      user:
        path: /api/user
        response:
          headers:
            Content-Type: application/json; UTF-8
        items:
          login:
            path: /login
            method: POST
            title: 登录
            response:
              voFullName: CurrentUserInfoResponseVo
          logout:
            path: /logout
            method: POST
            title: 退出登录
    ```

    - Here we define two routes:
      - `POST /api/user/login`, with request object model named `UserLoginRequestVo` (specified by `response.voFullName` in the configuration) and response object model named `CurrentUserInfoResponseVo`

      - `POST /api/user/logout`, with request object model named `UserLogoutRequestVo` and response object model named `UserLogoutResponseVo`

    - For more configuration details, see the class [RawApiConfig][api-config-rawapiconfig] defined in [src/core/types/api-config.ts][api-config]

  * Write the interface of the data model named `UserLoginRequestVo`, `CurrentUserInfoResponseVo`, `UserLogoutRequestVo` and `UserLogoutResponseVo`

  * Generate the schemas or start a mock server in the way mentioned above: [Cli Usage][usage-cli] and [Programming Usage][usage-programming]

## Related
  * [Examples][example]

<!-- 参考链接 -->
[json-schema]: https://json-schema.org/
[json-schema-faker]: https://github.com/json-schema-faker/json-schema-faker
[@barusu/typescript-json-schema]: https://github.com/guanghechen/barusu/blob/main/packages/typescript-json-schema
[generate-command]: https://github.com/guanghechen/barusu/blob/main/tools/restful-api/src/core/generate/command.ts#L74
[serve-command]: https://github.com/guanghechen/barusu/blob/main/tools/restful-api/src/core/serve/command.ts#L93
[api-config]: https://github.com/guanghechen/barusu/blob/main/tools/restful-api/src/types/api-config.ts
[api-config-rawapiconfig]: https://github.com/guanghechen/barusu/blob/main/tools/restful-api/src/types/api-config.ts#L7
[example]: https://github.com/guanghechen/barusu/tree/main/tools/restful-api/example

[usage-cli]: #Cli-Usage
[usage-programming]: #Programming-Usage
[demo]: #Demo
