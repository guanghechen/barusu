import fs from 'fs-extra'
import path from 'path'
import { optionMaster } from 'option-master'


function generate(schemaName: string) {
  const rawSchemaPath = path.resolve(__dirname, `../src/core/config/${ schemaName }.raw.schema.json`)
  const schemaPath = path.resolve(__dirname, `../src/core/config/${ schemaName }.schema.json`)
  const rawDataSchemaContent: string = fs.readFileSync(rawSchemaPath, 'utf-8')
  const rawDataSchema = JSON.parse(rawDataSchemaContent)
  const result = optionMaster.compile(rawDataSchema)
  const json = optionMaster.toJSON(result.value!)
  const data = JSON.stringify(json, null, 2)
  fs.writeFileSync(schemaPath, data, 'utf-8')
}


generate('app')
generate('api')
