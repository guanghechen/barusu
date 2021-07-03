import { absoluteOfWorkspace } from '@guanghechen/file-helper'
import { isObject } from '@guanghechen/option-helper'
import Router from '@koa/router'
import fs from 'fs-extra'
import path from 'path'
import supertest from 'supertest'
import type { RestfulApiServeContext, SubCommandServeOptions } from '../src'
import {
  COMMAND_NAME,
  RestfulApiServeProcessor,
  createProgram,
  createRestfulApiServeContextFromOptions,
  createSubCommandServe,
  execSubCommandGenerate,
} from '../src'

describe('serve', function () {
  const caseRootDirectory = path.resolve(
    __dirname,
    'fixtures',
    'mock-workspaces',
  )
  const kases = fs.readdirSync(caseRootDirectory)

  for (const kase of kases) {
    const title = kase
    const projectDir = absoluteOfWorkspace(caseRootDirectory, kase)
    const caseData = fs.readJSONSync(path.resolve(projectDir, 'case.json'))

    // clean
    const logRootDir = '__tmp__/logs/serve'
    const absoluteLogRootDir = absoluteOfWorkspace(projectDir, logRootDir)
    fs.removeSync(absoluteLogRootDir)

    // clear output directory before run test
    const schemaRootDir = 'mock/schemas'
    const absoluteSchemaRootDir = absoluteOfWorkspace(projectDir, schemaRootDir)

    // eslint-disable-next-line jest/valid-title
    test(title, async function () {
      const program = createProgram()

      // generate schemas
      await execSubCommandGenerate(program, [
        '',
        COMMAND_NAME,
        'generate',
        projectDir,
        '--log-level=warn',
        '--config-path=app.yml',
        '--schema-root-path=' + schemaRootDir,
      ])

      const promise = new Promise<RestfulApiServeContext>(resolve => {
        program.addCommand(
          createSubCommandServe(
            async (options: SubCommandServeOptions): Promise<void> => {
              const context: RestfulApiServeContext =
                await createRestfulApiServeContextFromOptions(options)
              resolve(context)
            },
          ),
        )
      })

      const args = [
        '',
        COMMAND_NAME,
        'serve',
        projectDir,
        '--log-level=warn',
        '--config-path=app.yml',
        '--schema-root-path=' + schemaRootDir,
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

      // test request with json response
      const jsonRequestCases = [
        { url: '/uu/vv', method: 'get', exact: true, absolutePath: false },
        ...caseData.jsonRequestCases,
      ].map(item => {
        if (item.absolutePath) return item
        return { ...item, url: context.prefixUrl + item.url }
      })
      expect(jsonRequestCases).toMatchSnapshot('jsonRequestCases')
      for (const item of jsonRequestCases) {
        const response = await request[item.method](item.url)
        const result = extractFromSupertestResponse(response)

        if (item.exact) {
          result.text = response.text
        } else {
          result.dataKeys = Object.keys(response.body)
          if (response.body.result != null) {
            if (isObject(response.body.result)) {
              result.dataResultKeys = Object.keys(response.body.result)
            } else {
              result.dataResultType = typeof response.body.result
            }
          }
        }

        expect(result).toMatchSnapshot(item.url + ' ' + item.method)
      }

      // test request with resource file response
      const resourceRequestCases = [...caseData.resourceRequestCases].map(
        item => {
          if (item.absolutePath) return item
          return { ...item, url: context.prefixUrl + item.url }
        },
      )
      expect(resourceRequestCases).toMatchSnapshot('resourceRequestCases')
      for (const item of resourceRequestCases) {
        const response = await request.get(item.url)
        const result = extractFromSupertestResponse(response)
        expect(result).toMatchSnapshot(item.url + ' ' + item.method)
      }

      // close server
      await server.stop()

      fs.removeSync(absoluteSchemaRootDir)
    })
  }
})

/**
 * Extracted interesting data from ResSE Headers
 * @param response
 */
function extractFromSupertestResponse(response: supertest.Response): any {
  const headers = { ...response.headers }
  delete headers.date
  delete headers['last-modified']
  delete headers['content-length']

  return {
    type: response.type,
    headers: headers,
  }
}
