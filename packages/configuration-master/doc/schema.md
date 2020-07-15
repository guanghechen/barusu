# TopDataSchema
  * The top-level DataSchema, which is the root node of the DataSchema data tree.
  * Corresponds to the JSON-SCHEMA file.
  * Defines the common state and entry nodes in the DataSchema tree.

  ---

  * 顶层 DataSchema，即 DataSchema 数据树的根节点；
  * 和 JSON-SCHEMA 文件对应；
  * 定义了 DataSchema 树中的公共状态和入口节点

  ## [RawTopDataSchema][]
  ```typescript
  interface RawTopDataSchema extends RawDataSchema {
    type: 'array'
    required?: boolean
    default?: boolean
    definitions?: { [name: string]: RawDefinitionDataSchema<T, V> }
  }
  ```

  ## [TopDataSchema][]
  ```typescript
  interface TopDataSchema extends DataSchema {
    type: 'array'
    required: boolean
    default?: boolean
    definitions?: { [name: string]: DefinitionDataSchema<T, V> }
  }
  ```

  ## properties:

   property       | description                               | default | required
  :---------------|:------------------------------------------|:--------|:---------------------------------------
   `type`         | the type of DataSchema                    | -       | Yes (and the value must be `'array'`)
   `required`     | whether the data must be set              | `false` | No
   `default`      | default value of this DataSchema          | -       | No
   `definitions`  | define DataSchemas that can be reused     | -       | No

# DefinitionDataSchema
  Define a reusable DataSchema which can be referenced by `$ref` in RefDataSchema

  ---

  定义可被重复使用的 DataSchema，即可被 RefDataSchema 中的 `$ref` 所引用的 DataSchema

  ## [RawDefinitionDataSchema][]
  ```typescript
  interface RawDefinitionDataSchema extends RawDataSchema {
    type: 'array'
    required?: boolean
    default?: boolean
    $id?: string
  }
  ```

  ## [DefinitionDataSchema][]
  ```typescript
  interface DefinitionDataSchema extends DataSchema {
    type: 'array'
    required: boolean
    default?: boolean
    $id?: string
  }
  ```

  ## properties:

   property       | description                               | default | required
  :---------------|:------------------------------------------|:--------|:---------------------------------------
   `type`         | the type of DataSchema                    | -       | Yes (and the value must be `'array'`)
   `required`     | whether the data must be set              | `false` | No
   `default`      | default value of this DataSchema          | -       | No
   `$id`          | the unique identifier of the DataSchema   | -       | No

# DataSchema
  ## [RawDataSchema][]
  ```typescript
  interface RawDataSchema {
    type: 'array'
    required?: boolean
    default?: boolean
  }
  ```

  ## [DataSchema][]
  ```typescript
  interface DataSchema {
    type: 'array'
    required: boolean
    default?: boolean
  }
  ```

  ## properties:

   property   | description                               | default | required
  :-----------|:------------------------------------------|:--------|:---------------------------------------
   `type`     | the type of DataSchema                    | -       | Yes (and the value must be `'array'`)
   `required` | whether the data must be set              | `false` | No
   `default`  | default value of this DataSchema          | -       | No

## Preset DataSchema

  * [ArrayDataSchema][]
  * [BooleanDataSchema][]
  * [CombineDataSchema][]
  * [NullDataSchema][]
  * [NumberDataSchema][]
  * [IntegerDataSchema][]
  * [ObjectDataSchema][]
  * [RefDataSchema][]
  * [StringDataSchema][]

# also see
  * [demo][]
  * [test cases][test-cases]
  * [https://json-schema.org/understanding-json-schema/structuring.html#reuse](https://json-schema.org/understanding-json-schema/structuring.html#reuse)

[demo]: ../../demo
[test-cases]: ../../test/cases/data-schema

[RawDataSchema]: ../src/_core/schema/types.ts#RawDataSchema
[DataSchema]: ../src/_core/schema/types.ts#DataSchema
[RawDefinitionDataSchema]: ../src/_core/schema/types.ts#RawDefinitionDataSchema
[DefinitionDataSchema]: ../src/_core/schema/types.ts#DefinitionDataSchema
[RawTopDataSchema]: ../src/_core/schema/types.ts#RawTopDataSchema
[TopDataSchema]: ../src/_core/schema/types.ts#TopDataSchema

<!-- preset schemas -->
[ArrayDataSchema]: https://github.com/lemon-clown/barusu/blob/master/packages/configuration-master/doc/schemas/array.md
[BooleanDataSchema]: https://github.com/lemon-clown/barusu/blob/master/packages/configuration-master/doc/schemas/boolean.md
[CombineDataSchema]: https://github.com/lemon-clown/barusu/blob/master/packages/configuration-master/doc/schemas/combine.md
[NullDataSchema]: https://github.com/lemon-clown/barusu/blob/master/packages/configuration-master/doc/schemas/null.md
[NumberDataSchema]: https://github.com/lemon-clown/barusu/blob/master/packages/configuration-master/doc/schemas/number.md
[IntegerDataSchema]: https://github.com/lemon-clown/barusu/blob/master/packages/configuration-master/doc/schemas/integer.md
[ObjectDataSchema]: https://github.com/lemon-clown/barusu/blob/master/packages/configuration-master/doc/schemas/object.md
[RefDataSchema]: https://github.com/lemon-clown/barusu/blob/master/packages/configuration-master/doc/schemas/ref.md
[StringDataSchema]: https://github.com/lemon-clown/barusu/blob/master/packages/configuration-master/doc/schemas/string.md
