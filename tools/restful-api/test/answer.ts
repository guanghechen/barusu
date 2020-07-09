// import chalk from 'chalk'
// import path from 'path'
// import {
//   ApiItemParser,
//   GenerateCommand,
//   SubCommandHook,
//   execCommand,
// } from '../src'
// import { ApiItemParserTestCaseMaster } from './util/api-parser-case-util'
// import { CommandTestCaseMaster } from './util/command-case-util'


// /**
//  * create answer (to be checked)
//  */
// async function answer() {
//   const caseRootDirectory: string = path.resolve('test/cases')

//   // ApiItemParser cases
//   const apiItemParser = new ApiItemParser()
//   const apiItemParserCaseMaster = new ApiItemParserTestCaseMaster(apiItemParser, { caseRootDirectory })
//   await apiItemParserCaseMaster.scan('api-item')
//   await apiItemParserCaseMaster.answer()

//   // answer sub-command
//   const commandCaseMaster = new CommandTestCaseMaster({ caseRootDirectory })
//   await commandCaseMaster.scan('sub-command/generate/simple')
//   await commandCaseMaster.answer(async kase => {
//     const projectDir = kase.dir
//     const args = ['', '', 'generate', projectDir, '--log-level=debug', '-s', 'schemas/answer']
//     console.log(chalk.gray('--> ' + args.join(' ')))

//     const generate = new GenerateCommand()
//     const promise = new Promise(resolve => {
//       generate.onHook(SubCommandHook.AFTER_COMPLETED, resolve)
//     })

//     execCommand(args, { generate })

//     // await generate completed
//     await promise
//   })
// }


// answer()
