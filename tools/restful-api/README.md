[![npm version](https://img.shields.io/npm/v/restful-api-tool.svg)](https://www.npmjs.com/package/restful-api-tool)
[![npm download](https://img.shields.io/npm/dm/restful-api-tool.svg)](https://www.npmjs.com/package/restful-api-tool)
[![npm license](https://img.shields.io/npm/l/restful-api-tool.svg)](https://www.npmjs.com/package/restful-api-tool)
[![git action](https://action-badges.now.sh/lemon-clown/restful-api-tool?action=test)](https://github.com/lemon-clown/restful-api-tool/actions)

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
      - In addition, `serve` also supports custom routing, which is based on `koa` and `koa-router`. If you want to support custom routing while generating mock server, see below

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
      - 此外，`serve` 还支持自定义路由，它基于 `koa` 和 `koa-router`，如果你想要在生成 mock server 的同时还支持自定义路由的话，可参见下文


# Install

  ```shell
  # Global installation
  yarn global add restful-api-tool
  # or use npm: npm install -g restful-api-tool

  # Init mock server project
  rapit init demo-mock-server --log-level verbose

  # or use npx: npx restful-api-tool init demo-mock-server -- --log-level verbose
  ```

# Cli Usage
  ```shell
  cd demo-mock-server
  yarn serve:cli
  ```

## Usage
  ```shell
  $ rapit --help

  Usage: command [options] [command]

  Options:
    -V, --version                              output the version number
    -c, --config-path <config-path>            specify the file path of main config (absolute or relative to the cwd) (default: "app.yml")
    -f, --api-config-path <api-config-path>    specify the file/directory path of api-item config file (absolute or relative to the cwd) (default: "api.yml")
    -s, --schema-root-path <schema-root-path>  specify the root path of schema (absolute or relative to the cwd) (default: "schemas")
    --encoding <encoding>                      specify encoding of all files. (default: "utf-8")
    --log-level <level>                        specify logger's level.
    -h, --help                                 output usage information

  Commands:
    generate|g [options] <project-dir>
    serve|s [options] <project-dir>
    init|i <project-dir>
  ```

### init
  ```shell
  $ rapit init --help
  Usage: rapit init|i [options] <project-dir>

  Options:
    -h, --help  output usage information
  ```

### generate
  ```shell
  $ rapit generate --help

  Usage: command generate|g [options] <project-dir>

  Options:
    -p, --tsconfig-path <tsconfigPath>  specify the location (absolute or relative to the projectDir) of typescript config file.
    -I, --ignore-missing-models         ignore missing model.
    --clean                             clean schema folders before generate.
    -h, --help                          output usage information
  ```

### serve
  ```shell
  $ rapit serve --help

  Usage: command serve|s [options] <project-dir>

  Options:
    -h, --host <host>                                    specify the ip/domain address to which the mock-server listens.
    -p, --port <port>                                    specify the port on which the mock-server listens.
    --prefix-url <prefixUrl>                             specify the prefix url of routes.
    --mock-required-only                                 json-schema-faker's option `requiredOnly`
    --mock-optionals-always                              json-schema-faker's option `alwaysFakeOptionals`
    --mock-optionals-probability <optionalsProbability>  json-schema-faker's option `optionalsProbability`
    --mock-use-data-file-first <mockDataFileRootPath>    specify the mock data file root path.
    --mock-data-file-first                               preferred use data file as mock data source.
    -h, --help                                           output usage information
  ```

# Programming Usage
  ```shell
  yarn add --dev restful-api-tool
  # or use npm: npm install --save-dev restful-api-tool
  ```

## Usage
  * Omit files defined in [Demo][demo]...

  * create a script file named `script/server.ts`, and add content like this:
    ```typescript
    import path from 'path'
    import chalk from 'chalk'
    import { execCommand, Router, ServeCommand, SubCommandHook } from 'restful-api-tool'

    async function serve () {
      const projectDir = path.resolve()
      const args = ['', '', 'serve', projectDir, '--log-level=debug', '-s', 'schemas/answer']
      console.log(chalk.gray('--> ' + args.join(' ')))

      const serve = new ServeCommand()
      serve.onHook(SubCommandHook.BEFORE_START, (server, context) => {
        const router = new Router({ prefix: context.prefixUrl })
        router.get('/hello/world', ctx => {
          ctx.body = {
            code: 200,
            message: 'Got it!',
          }
        })
        server.registerRouter(router)
      })

      execCommand(args, { serve })
    }
    serve()
    ```

  * Here we customize a route `GET /{context.prefixUrl}/hello/world`, combined with the definition in [Demo][demo], where the value of `context.prefixUrl` is `/mock`, so the route path is `/mock/hello/world`

  * run the command `node -r ts-node/register script/serve.ts` to start the mock server, and the custom route `GET /mock/hello/world` also will be registered in the server

# Demo
  * Create an empty ts project
  * Add a `tsconfig.json` file (you can specify other paths through `-p, --tsconfig-path <tsconfig-path>` in the sub-command `generate`), as follows
    ```json
    {
      "compilerOptions": {
        "strict": true,
        "moduleResolution": "node",
        "strictNullChecks": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "noImplicitAny": true,
        "noImplicitThis": true,
        "noImplicitReturns": false,
        "alwaysStrict": true,
        "suppressImplicitAnyIndexErrors": true,
        "newLine": "LF",
        "noEmitOnError": true,
        "pretty": false,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true
      },
      "include": [
        "src"
      ]
    }
    ```

  * Add a `package.json` file, like this:
    ```json
    {
      "name": "restful-api-tool---demo",
      "version": "0.0.0",
      "private": true,
      "scripts": {
        "build:schemas": "rapit generate .",
        "serve:cli": "nodemon --exec \"yarn build:schemas && rapit serve .\"",
        "serve:program": "nodemon --exec \"yarn build:schemas && node -r ts-node/register script/serve.ts\""
      },
      "devDependencies": {
        "nodemon": "^1.19.1",
        "restful-api-tool": "^0.0.5",
        "ts-node": "^8.4.1",
        "typescript": "^3.6.3"
      }
    }
    ```

  * Add a project configuration file named `app.yml` (other paths can be used, but the command-line option `-c, --config-path <config-path>` needs to be used to specify the path of the custom project configuration file), the content is as follows:
    ```yaml
    globalOptions:
      encoding: utf-8
      logLevel: debug

    generate:
      clean: true
      muteMissingModel: true
      ignoredDataTypes:
        - 'undefined'
      schemaArgs:
        ref: false
        required: true

    serve:
      host: '0.0.0.0'
      port: 8091
      prefixUrl: /mock
      mockDataFileFirst: true
      mockDataFileRootPath: data/
      mockOptionalsAlways: true
      mockOptionalsProbability: 0.7
    ```

    - Here we specify the `generate` and` serve` command options. Please note that command line parameters can override the values of these options.

    - For more configuration details, see the class [GenerateContextConfig][app-config-generate] and [ServeContextConfig][app-config-serve] defined in [src/core/types/context.ts][app-config]

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
              fullModelName: CurrentUserInfoResponseVo
          logout:
            path: /logout
            method: POST
            title: 退出登录
    ```

    - Here we define two routes:
      - `POST /api/user/login`, with request object model named `UserLoginRequestVo` (specified by `response.fullModelName` in the configuration) and response object model named `CurrentUserInfoResponseVo`

      - `POST /api/user/logout`, with request object model named `UserLogoutRequestVo` and response object model named `UserLogoutResponseVo`

    - For more configuration details, see the class [RawApiConfig][api-config-rawapiconfig] defined in [src/core/types/api-config.ts][api-config]

  * Write the interface of the data model named `UserLoginRequestVo`, `CurrentUserInfoResponseVo`, `UserLogoutRequestVo` and `UserLogoutResponseVo`

  * Generate the schemas or start a mock server in the way mentioned above: [Cli Usage][usage-cli] and [Programming Usage][usage-programming]

# More
  * see [example][]

<!-- 参考链接 -->
[json-schema]: https://json-schema.org/
[json-schema-faker]: https://github.com/json-schema-faker/json-schema-faker
[typescript-json-schema]: https://github.com/lemon-clown/typescript-json-schema
[app-config]: https://github.com/lemon-clown/restful-api-tool/blob/master/src/core/types/context.ts
[app-config-generate]: https://github.com/lemon-clown/restful-api-tool/blob/develop/src/core/types/context.ts#L39
[app-config-serve]: https://github.com/lemon-clown/restful-api-tool/blob/develop/src/core/types/context.ts#L91
[api-config]: https://github.com/lemon-clown/restful-api-tool/blob/master/src/core/types/api-config.ts
[api-config-rawapiconfig]: https://github.com/lemon-clown/restful-api-tool/blob/master/src/core/types/api-config.ts#L7
[example]: https://github.com/lemon-clown/restful-api-tool/tree/master/example

[usage-cli]: #Cli-Usage
[usage-programming]: #Programming-Usage
[demo]: #Demo
