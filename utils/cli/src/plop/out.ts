import chalk from 'chalk'
import nodePlop, { PlopGenerator, PlopGeneratorConfig } from 'node-plop'


const typeDisplay = {
  'function': chalk.yellow('->'),
  'add':      chalk.green('++'),
  'addMany':  chalk.green('+!'),
  'modify':   `${ chalk.green('+') }${ chalk.red('-') }`,
  'append':   chalk.green('_+'),
  'skip':     chalk.green('--'),
}


/**
 *
 * @param name
 * @param noMap
 */
export function typeMap(name: string, noMap: boolean): string {
  const dimType = chalk.dim(name)
  return (noMap ? dimType : typeDisplay[name] || dimType)
}


/**
 * Choose generator
 *
 * @param plopList
 * @param message
 */
export function choosePlopGenerator(
  plopList: { name: string; description: string }[],
  message?: string,
): Promise<PlopGenerator> {
  const plop = nodePlop('')
  const generator = plop.setGenerator('choose', {
    description: 'Choose plop generator',
    actions:     [],
    prompts:     [{
      type:    'list',
      name:    'generator',
      message: message || chalk.blue('[PLOP]') + ' Please choose a generator.',
      choices: plopList.map(function (p) {
        return {
          name:  p.name + chalk.gray(!!p.description ? ' - ' + p.description : ''),
          value: p.name
        }
      })
    }]
  } as PlopGeneratorConfig)
  return generator
    .runPrompts()
    .then(results => results.generator)
}
