import fs from 'fs-extra'
import path from 'path'
import rimraf from 'rimraf'
import supertest from 'supertest'
import { absoluteOfWorkspace } from '@barusu/util-cli'
import Router from '@koa/router'
import {
  COMMAND_NAME,
  RestfulApiServeContext,
  RestfulApiServeProcessor,
  SubCommandServeOptions,
  createProgram,
  createRestfulApiServeContextFromOptions,
  createSubCommandServe,
} from '../src'


describe('serve', function () {
  const caseRootDirectory = path.resolve(__dirname, 'cases', 'mock-workspaces')
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
          async (options: SubCommandServeOptions): Promise<void> => {
            const context: RestfulApiServeContext =
              await createRestfulApiServeContextFromOptions(options)
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
      const server = new RestfulApiServeProcessor(context)

      const router = new Router()
      router.get(context.prefixUrl + '/uu/vv', ctx => {
        // eslint-disable-next-line no-param-reassign
        ctx.body = {
          code: 200,
          message: 'Got it!',
        }
      })

      server.registerRouter(router)
      await server.start()

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
