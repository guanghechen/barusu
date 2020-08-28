import fs from 'fs-extra'
import path from 'path'
import rimraf from 'rimraf'
import supertest from 'supertest'
import { name } from '@barusu/tool-restful-api/package.json'
import { absoluteOfWorkspace } from '@barusu/util-cli'
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


describe('serve', function () {
  const caseRootDirectory = path.resolve(__dirname, 'cases', 'generate')
  const kases = fs.readdirSync(caseRootDirectory)

  for (const kase of kases) {
    const title = kase
    const projectDir = absoluteOfWorkspace(caseRootDirectory, kase)

    // clean
    const logRootDir = '__tmp__/logs/serve'
    const absoluteLogRootDir = absoluteOfWorkspace(projectDir, logRootDir)
    rimraf.sync(absoluteLogRootDir)

    test(title, async function () {
      const program = createProgram()
      const promise = new Promise<RestfulApiServeContext>(resolve => {
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
            resolve(context)
          }
        ))
      })

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

      program.parse(args)

      const context = await promise

      const router = new Router()
      router.get(context.prefixUrl + '/uu/vv', ctx => {
        console.log('okay')
        // eslint-disable-next-line no-param-reassign
        ctx.body = {
          code: 200,
          message: 'Got it!',
        }
      })

      const server = new RestfulApiServeProcessor(context)
      server.registerRouter(router)
      await server.start()


      // waiting the program finished
      const request = supertest(server.app!.callback())

      const requestItem = [
        { url: context.prefixUrl + '/uu/vv', method: 'get' },
      ]
      for (const item of requestItem) {
        const response = await request[item.method](item.url)
        expect({
          status: response.status,
          text: response.text,
        }).toMatchSnapshot(item.url + '__' + item.method)
      }

      // close server
      await server.stop()
    })
  }
})
