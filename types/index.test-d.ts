import { mergeSchemas, MergeOptions, resolvers, KeywordResolver } from '..'
import { expectType } from 'tsd'

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
        keyword: string,
        keywordValues: any[],
        mergedSchema: any,
        parentSchemas: any[],
        options: MergeOptions
      ) => {
        expectType<string>(keyword)
        expectType<any[]>(keywordValues)
        expectType<any>(mergedSchema)
        expectType<any[]>(parentSchemas)
        expectType<MergeOptions>(options)

        return keywordValues
      }
    },
    defaultResolver: (
      keyword: string,
      keywordValues: any[],
      mergedSchema: any,
      parentSchemas: any[],
      options: MergeOptions
    ) => {
      expectType<string>(keyword)
      expectType<any[]>(keywordValues)
      expectType<any>(mergedSchema)
      expectType<any[]>(parentSchemas)
      expectType<MergeOptions>(options)

      return keywordValues
    },
    onConflict: 'throw'
  }

  mergeSchemas([schema1, schema2], mergeOptions)
}

expectType<KeywordResolver>(resolvers.arraysIntersection)
expectType<KeywordResolver>(resolvers.hybridArraysIntersection)
expectType<KeywordResolver>(resolvers.arraysUnion)
expectType<KeywordResolver>(resolvers.minNumber)
expectType<KeywordResolver>(resolvers.maxNumber)
expectType<KeywordResolver>(resolvers.commonMultiple)
expectType<KeywordResolver>(resolvers.allEqual)
expectType<KeywordResolver>(resolvers.booleanAnd)
expectType<KeywordResolver>(resolvers.booleanOr)
expectType<KeywordResolver>(resolvers.skip)
