import chalk from 'chalk'
import path from 'path'
import { name } from '@barusu/tool-restful-api/package.json'
import Router from '@koa/router'
import {
  COMMAND_NAME,
  RestfulApiServeContext,
  RestfulApiServeProcessor,
  SubCommandServeOptions,
  createProgram,
  createRestfulApiServeContext,
  createSubCommandServe,
} from '../src'


async function testServeCommand (caseDir: string) {
  const program = createProgram()
  program.addCommand(createSubCommandServe(
    name,
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
        mockDataPrefixUrl: options.mockDataPrefixUrl,
        mockDataRootDir: options.mockDataRootDir,
        mockResourcePrefixUrl: options.mockResourcePrefixUrl,
        mockResourceRootDir: options.mockResourceRootDir,
      })

      const processor = new RestfulApiServeProcessor(context)

      const router = new Router()
      router.get(context.prefixUrl + '/uu/vv', ctx => {
        console.log('okay')
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

  const projectDir = path.resolve(__dirname, 'cases/sub-command', caseDir)
  const args = [
    '',
    COMMAND_NAME,
    'serve',
    projectDir,
    '--log-level=debug',
    '--config-path=app.yml',
    '--api-config-path=api.yml',
    '--schema-root-path=schemas/answer',
  ]
  console.log(chalk.gray('--> ' + args.join(' ')))
  program.parse(args)
}


testServeCommand('generate/simple')
