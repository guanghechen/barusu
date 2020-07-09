// import { describe, it } from 'mocha'
// import chalk from 'chalk'
// import path from 'path'
// import { GenerateCommand, SubCommandHook, execCommand } from '../src'
// import { CommandTestCaseMaster } from './util/command-case-util'


// it('This is a required placeholder to allow before() to work', () => { })
// before(async function test() {
//   const caseRootDirectory = path.resolve('test/cases')
//   const caseMaster = new CommandTestCaseMaster({ caseRootDirectory })
//   await caseMaster.scan('sub-command/generate/simple')
//   describe('SubCommand:generate test cases', function () {
//     this.timeout(5000)
//     caseMaster.test(async kase => {
//       const projectDir = kase.dir
//       const args = ['', '', 'generate', projectDir, '--log-level=warn', '-s', 'schemas/output']
//       console.log(chalk.gray('--> ' + args.join(' ')))

//       const generate = new GenerateCommand()
//       const promise = new Promise(resolve => {
//         generate.onHook(SubCommandHook.AFTER_COMPLETED, resolve)
//       })

//       execCommand(args, { generate })

//       // await generate completed
//       await promise

//       // test whether the result is matched with the answer
//       const outputPath = path.resolve(projectDir, 'schemas/output')
//       const answerPath = path.resolve(projectDir, 'schemas/answer')
//       caseMaster.compareDirs(outputPath, answerPath)
//     })
//   })
// })
