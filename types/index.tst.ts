import { mergeSchemas, type MergeOptions } from '..'
import { expect } from 'tstyche'

{
  const schema1 = { type: 'string', enum: ['foo', 'bar'] }
  const schema2 = { type: 'string', enum: ['foo', 'baz'] }

  mergeSchemas([schema1, schema2])
}

{
  const schema1 = { type: 'string', enum: ['foo', 'bar'] }
  const schema2 = { type: 'string', enum: ['foo', 'baz'] }

  const mergeOptions: MergeOptions = {
    resolvers: {
      enum: (
        keyword,
        keywordValues,
        mergedSchema,
        parentSchemas,
        options
      ) => {
        expect(keyword).type.toBe<string>()
        expect(keywordValues).type.toBe<any[]>()
        expect(mergedSchema).type.toBe<any>()
        expect(parentSchemas).type.toBe<any[]>()
        expect(options).type.toBe<MergeOptions>()

        return keywordValues
      }
    },
    defaultResolver: (
      keyword,
      keywordValues,
      mergedSchema,
      parentSchemas,
      options
    ) => {
      expect(keyword).type.toBe<string>()
      expect(keywordValues).type.toBe<any[]>()
      expect(mergedSchema).type.toBe<any>()
      expect(parentSchemas).type.toBe<any[]>()
      expect(options).type.toBe<MergeOptions>()
      expect(options).type.toBe<MergeOptions>()

      return keywordValues
    },
    onConflict: 'throw'
  }

  mergeSchemas([schema1, schema2], mergeOptions)
}
