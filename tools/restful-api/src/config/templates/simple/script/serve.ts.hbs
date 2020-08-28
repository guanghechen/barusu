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
      'serve',
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
