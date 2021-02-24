import { SchemaArgs } from './types'

/**
 * default schema args
 */
export function getDefaultArgs(): SchemaArgs {
  return {
    ref: true,
    aliasRef: false,
    topRef: false,
    titles: false,
    defaultProps: false,
    noExtraProps: false,
    propOrder: false,
    typeOfKeyword: false,
    required: false,
    strictNullChecks: false,
    ignoreErrors: false,
    out: '',
    validationKeywords: [],
    include: [],
    excludePrivate: false,
    uniqueNames: false,
    rejectDateType: false,
    id: '',
    defaultNumberType: 'number',
  }
}

/**
 * Default JSDoc keywords that should be used to annotate the JSON schema.
 *
 * Many of these validation keywords are defined here: http://json-schema.org/latest/json-schema-validation.html
 */
export const defaultValidationKeywords = Object.freeze({
  multipleOf: true, // 6.1.
  maximum: true, // 6.2.
  exclusiveMaximum: true, // 6.3.
  minimum: true, // 6.4.
  exclusiveMinimum: true, // 6.5.
  maxLength: true, // 6.6.
  minLength: true, // 6.7.
  pattern: true, // 6.8.
  items: true, // 6.9.
  // additionalItems: true,          // 6.10.
  maxItems: true, // 6.11.
  minItems: true, // 6.12.
  uniqueItems: true, // 6.13.
  contains: true, // 6.14.
  maxProperties: true, // 6.15.
  minProperties: true, // 6.16.
  // required: true,                 // 6.17.  This is not required. It is auto-generated.
  // properties: true,               // 6.18.  This is not required. It is auto-generated.
  // patternProperties: true,        // 6.19.
  additionalProperties: true, // 6.20.
  // dependencies: true,             // 6.21.
  // propertyNames: true,            // 6.22.
  enum: true, // 6.23.
  // const: true,                    // 6.24.
  type: true, // 6.25.
  // allOf: true,                    // 6.26.
  // anyOf: true,                    // 6.27.
  // oneOf: true,                    // 6.28.
  // not: true,                      // 6.29.
  examples: true, // Draft 6 (draft-handrews-json-schema-validation-01)

  ignore: true,
  description: true,
  format: true,
  default: true,
  $ref: true,
  id: true,
})

/**
 * Subset of descriptive, non-type keywords that are permitted alongside a $ref.
 * Prior to JSON Schema draft 2019-09, $ref is a special keyword that doesn't
 * permit keywords alongside it, and so AJV may raise warnings if it encounters
 * any type-related keywords; see https://github.com/ajv-validator/ajv/issues/1121
 */
export const annotationKeywords: {
  [k in keyof typeof defaultValidationKeywords]?: true
} = {
  description: true,
  default: true,
  examples: true,
  // A JSDoc $ref annotation can appear as a $ref.
  $ref: true,
}

export const subDefinitions = {
  items: true,
  additionalProperties: true,
  contains: true,
}
