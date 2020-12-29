import type { ChalkLogger } from '@barusu/chalk-logger'
import type {
  NodePlopAPI,
  PlopActionHooksChanges,
  PlopActionHooksFailures,
} from './types'
import { PlopGenerator } from 'node-plop'
import Ora from 'ora'
import { choosePlopGenerator, typeMap } from './out'


// eslint-disable-next-line new-cap
const progressSpinner = Ora()


/**
 *
 * @param generator
 * @param bypassArr
 */
export async function doThePlop(
  generator: PlopGenerator,
  bypassArr?: string[],
  defaultAnswers: Record<string, unknown> = {},
  opts = { showTypeNames: false },
): Promise<void> {
  const answers = {
    ...defaultAnswers,
    ...(await generator.runPrompts(bypassArr)),
  }

  const noMap = opts.showTypeNames

  const onComment = (msg: string) => {
    progressSpinner.info(msg)
    progressSpinner.start()
  }

  const onSuccess = (change: PlopActionHooksChanges) => {
    let line = ''
    if (change.type) { line += ` ${ typeMap(change.type, noMap) }` }
    if (change.path) { line += ` ${ change.path }` }
    progressSpinner.succeed(line)
    progressSpinner.start()
  }

  const onFailure = (fail: PlopActionHooksFailures) => {
    let line = ''
    if (fail.type) { line += ` ${ typeMap(fail.type, noMap) }` }
    if (fail.path) { line += ` ${ fail.path }` }

    const errMsg = fail.error || fail.message
    if (errMsg) { line += ` ${ errMsg }` }
    progressSpinner.fail(line)
    progressSpinner.start()
  }

  progressSpinner.start()
  await generator.runActions(answers, { onSuccess, onFailure, onComment })
  progressSpinner.stop()
}


/**
 * Execute plop
 *
 * @param plop
 * @param logger
 */
export async function runPlop(
  plop: NodePlopAPI,
  logger: ChalkLogger,
  bypassArr?: string[],
  defaultAnswers: Record<string, unknown> = {},
): Promise<boolean> {
  const generators = plop.getGeneratorList()

  if (generators.length <= 0) {
    // no generators?! there's clearly something wrong here
    logger.error('[PLOP] No generator found in plopfile')
    return false
  }

  let generator: PlopGenerator | null = null
  const generatorNames = generators.map(v => v.name)

  if (generators.length === 1) {
    generator = plop.getGenerator(generatorNames[0])
  } else {
    generator = await choosePlopGenerator(generators, plop.getWelcomeMessage())
  }

  await doThePlop(generator, bypassArr, defaultAnswers)
  return true
}
