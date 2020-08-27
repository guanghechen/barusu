import path from 'path'
import chalk from 'chalk'
import Router from '@koa/router'
import {
  COMMAND_NAME,
  RestfulApiServeContext,
  RestfulApiServeProcessor,
  SubCommandServeOptions,
  createProgram,
  createRestfulApiServeContext,
  createSubCommandServe,
} from '@barusu/tool-restful-api'


async function serve () {
  const program = createProgram()
  program.addCommand(createSubCommandServe(
    'serve',
    async (options: SubCommandServeOptions): Promise<void> => {
      const context: RestfulApiServeContext = await createRestfulApiServeContext({
        cwd: options.cwd,
        workspace: options.workspace,
        tsconfigPath: options.tsconfigPath,
        schemaRootPath: options.schemaRootPath,
        apiConfigPath: options.apiConfigPath,
        encoding: options.encoding,
        host: options.host,
        port: options.port,
        prefixUrl: options.prefixUrl,
        mockRequiredOnly: options.mockRequiredOnly,
        mockOptionalsAlways: options.mockOptionalsAlways,
        mockOptionalsProbability: options.mockOptionalsProbability,
        mockDataFileFirst: options.mockDataFileFirst,
        mockDataFileRootPath: options.mockDataFileRootPath,
      })

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
  ))

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
}


serve()
