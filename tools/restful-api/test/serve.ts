import chalk from 'chalk'
import path from 'path'
import { Router, ServeCommand, SubCommandHook, execCommand } from '../src'


async function testServeCommand (caseDir: string) {
  const projectDir = path.resolve('test/cases/sub-command', caseDir)
  const args = ['', '', 'serve', projectDir, '--log-level=debug', '-s', 'schemas/answer']
  console.log(chalk.gray('--> ' + args.join(' ')))

  const serve = new ServeCommand()
  serve.onHook(SubCommandHook.BEFORE_START, (server, context) => {

    const router = new Router()
    router.get(context.prefixUrl + '/uu/vv', ctx => {
      console.log('okay')
      ctx.body = {
        code: 200,
        message: 'Got it!',
      }
    })
    server.registerRouter(router)
  })

  execCommand(args, { serve })
}


testServeCommand('generate/simple')
