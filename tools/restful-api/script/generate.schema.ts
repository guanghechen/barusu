import { configurationMaster } from '@barusu/configuration-master'
import fs from 'fs-extra'
import { calcConfigFilePath } from '../src'

function generate(rawSchemaPath: string, schemaPath: string): void {
  const rawDataSchemaContent: string = fs.readFileSync(rawSchemaPath, 'utf-8')
  const rawDataSchema = JSON.parse(rawDataSchemaContent)
  const result = configurationMaster.compile(rawDataSchema)
  const json = configurationMaster.toJSON(result.value!)
  const data = JSON.stringify(json, null, 2)
  fs.writeFileSync(schemaPath, data, 'utf-8')
}

generate(
  calcConfigFilePath('app-raw-schema.json'),
  calcConfigFilePath('app-schema.json'),
)
generate(
  calcConfigFilePath('api-raw-schema.json'),
  calcConfigFilePath('api-schema.json'),
)
