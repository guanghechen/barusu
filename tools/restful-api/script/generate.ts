import fs from 'fs-extra'
import path from 'path'
import { configurationMaster } from '@barusu/configuration-master'


function generate(schemaName: string) {
  const rawSchemaPath = path.resolve(__dirname, `../src/core/config/${ schemaName }.raw.schema.json`)
  const schemaPath = path.resolve(__dirname, `../src/core/config/${ schemaName }.schema.json`)
  const rawDataSchemaContent: string = fs.readFileSync(rawSchemaPath, 'utf-8')
  const rawDataSchema = JSON.parse(rawDataSchemaContent)
  const result = configurationMaster.compile(rawDataSchema)
  const json = configurationMaster.toJSON(result.value!)
  const data = JSON.stringify(json, null, 2)
  fs.writeFileSync(schemaPath, data, 'utf-8')
}


generate('app')
generate('api')
