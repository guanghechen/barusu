import * as TJS from '@barusu/typescript-json-schema'
import type { PartialArgs } from '@barusu/typescript-json-schema'
import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'
import type ts from 'typescript'
import { calcConfigFilePath } from '../src'

const tsconfigPath = path.resolve(__dirname, '../tsconfig.json')
const additionalCompilerOptions = {}
const additionalSchemaArgs: PartialArgs = {
  ref: true,
  titles: true,
  required: true,
  propOrder: false,
  aliasRef: true,
}
const program: ts.Program = TJS.programFromConfig(
  tsconfigPath,
  undefined,
  additionalCompilerOptions,
)
const generator: TJS.JsonSchemaGenerator = TJS.buildGenerator(
  program,
  additionalSchemaArgs,
)!

async function generate(
  modelName: string,
  rawSchemaPath: string,
): Promise<void> {
  const symbols = generator.getSymbols(modelName)
  if (symbols.length <= 0) {
    throw new Error(`${modelName} not found.`)
  }

  // If no title is specified, the model name is the title
  const model: TJS.Definition = generator.getSchemaForSymbol(modelName)

  const json: any = model
  if (json.title == null) json.title = modelName
  const data = JSON.stringify(json, null, 2)

  console.log(chalk.green(`output ${rawSchemaPath}`))
  await fs.writeFile(rawSchemaPath, data, 'utf-8')
}

// generate('app')
void generate('RawApiConfig', calcConfigFilePath('api-schema.json'))
