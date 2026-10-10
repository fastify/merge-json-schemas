'use strict'

const assert = require('node:assert/strict')
const { test } = require('node:test')
const Ajv = require('ajv')
const Ajv2020 = require('ajv/dist/2020')
const { mergeSchemas } = require('../index')
const mergeDiscriminator = require('../lib/merge-discriminator')

const options = { optimizeDiscriminators: true }

test('should keep discriminator optimization opt-in', () => {
  const schemas = ['a', 'b'].map(value => ({
    if: { properties: { kind: { const: value } } },
    then: { required: [value] }
  }))
  assert.deepStrictEqual(mergeSchemas(schemas), mergeSchemas(schemas, { optimizeDiscriminators: false }))
  assert.notDeepStrictEqual(mergeSchemas(schemas), mergeSchemas(schemas, options))
})

test('should preserve conditional validation for primitive discriminators', () => {
  const ajv = new Ajv({ strict: false })
  for (const required of [false, true]) {
    for (const objectType of [false, true]) {
      for (const propertyType of [undefined, 'string', 'number', 'integer', 'boolean', 'null']) {
        for (const values of [['a', 'b'], [0, -0, 1], [null, false, '']]) {
          for (const mode of ['then', 'else', 'both', 'false']) {
            const schemas = values.map((value, index) => {
              const condition = { properties: { kind: { const: value } } }
              if (required) condition.required = ['kind']
              if (objectType) condition.type = 'object'
              if (propertyType !== undefined) condition.properties.kind.type = propertyType
              const rule = { if: condition }
              if (mode !== 'else') rule.then = mode === 'false' ? false : { required: [`then${index}`] }
              if (mode === 'else' || mode === 'both') rule.else = { required: [`else${index}`] }
              return rule
            })
            const snapshot = structuredClone(schemas)
            const original = ajv.compile({ allOf: schemas })
            const merged = ajv.compile(mergeSchemas([{}, ...schemas], options))
            const inputs = [null, false, 0, '', [], {}, { kind: undefined }]
            for (const kind of [...values, 'unknown', 2, true, {}, []]) {
              for (const branches of ['missing', 'then', 'else', 'both']) {
                const data = { kind }
                for (let index = 0; index < values.length; index++) {
                  if (branches === 'then' || branches === 'both') data[`then${index}`] = true
                  if (branches === 'else' || branches === 'both') data[`else${index}`] = true
                }
                inputs.push(data)
              }
            }
            for (const input of inputs) {
              assert.equal(merged(input), original(input), JSON.stringify({ schemas, input }))
            }
            assert.deepStrictEqual(schemas, snapshot)
          }
        }
      }
    }
  }
})

test('should preserve evaluated-property annotations and strict required validation', () => {
  const ajv = new Ajv2020({ strict: true })
  const schemas = ['a', 'b'].map(value => ({
    if: { type: 'object', properties: { kind: { const: value } }, required: ['kind'] },
    then: { type: 'object', properties: { [value]: { type: 'integer' } } }
  }))
  const root = { type: 'object', unevaluatedProperties: false }
  const original = ajv.compile({ ...root, allOf: schemas })
  const merged = ajv.compile({ ...root, ...mergeSchemas(schemas, options) })
  for (const input of [{}, { kind: 'a' }, { kind: 'b' }, { kind: 'unknown' }, { kind: 'a', a: 1 }, { kind: 'b', a: 1 }]) {
    assert.equal(merged(input), original(input))
  }
  assert.equal(merged({ kind: 'unknown' }), false)
})

test('should keep the number of discriminator conditions linear', () => {
  const schemas = Array.from({ length: 50 }, (_, index) => ({
    if: { properties: { kind: { const: index } } },
    then: { properties: { [`value${index}`]: { type: 'integer' } } }
  }))
  const merged = mergeSchemas(schemas, options)
  assert.equal(JSON.stringify(merged).match(/"if":/g).length, 51)
  assert.ok(JSON.stringify(merged).length < 15000)
})

test('should keep defaults and references on the regular resolver', () => {
  const first = { if: { properties: { kind: { const: 'a' } } } }
  const second = { if: { properties: { kind: { const: 'b' } } }, then: { additionalProperties: false } }
  for (const keyword of ['default', '$ref', '$dynamicRef', '$recursiveRef', '$id']) {
    for (const branch of ['then', 'else']) {
      const schema = { ...first, [branch]: { properties: { kind: { [keyword]: 'a' } } } }
      assert.deepStrictEqual(mergeSchemas([schema, second], options), mergeSchemas([schema, second]))
    }
  }
  const schemas = [{ ...first, then: { properties: { kind: { default: 'a' } } } }, second]
  const ajv = new Ajv({ strict: false, useDefaults: true })
  const validate = ajv.compile(mergeSchemas(schemas, options))
  const input = {}
  assert.equal(validate(input), true)
  assert.deepStrictEqual(input, { kind: 'a' })
})

test('should use the regular resolver for other conditions', () => {
  const regular = { if: { properties: { kind: { const: 'a' } } }, then: {} }
  const conditions = [
    null, false, [],
    { not: {} },
    { type: 'string', properties: { kind: { const: 'b' } } },
    { properties: null }, { properties: 'kind' }, { properties: [] }, { properties: {} },
    { properties: { kind: {}, other: {} } },
    { properties: { kind: null } }, { properties: { kind: false } }, { properties: { kind: [] } },
    { properties: { kind: {} } },
    { properties: { kind: { const: 'b', enum: ['b'] } } },
    { properties: { kind: { const: 'b', type: 'object' } } },
    { properties: { kind: { const: {} } } },
    { properties: { kind: { const: [] } } },
    { properties: { kind: { const: Infinity } } },
    { properties: { kind: { const: 'b' } }, required: null },
    { properties: { kind: { const: 'b' } }, required: ['kind', 'other'] },
    { properties: { kind: { const: 'b' } }, required: ['other'] },
    { properties: { other: { const: 'b' } } },
    { properties: { kind: { const: 'b', type: 'string' } } },
    { properties: { kind: { const: 'b' } }, required: ['kind'] },
    { properties: { kind: { const: 'b' } }, type: 'object' }
  ]
  for (const condition of conditions) {
    assert.equal(mergeDiscriminator([regular, { if: condition }], () => assert.fail('Should fall back.')), undefined)
  }
  assert.equal(mergeDiscriminator([{}, regular], () => assert.fail('Should fall back.')), undefined)
})

test('should handle empty required arrays and boolean branches', () => {
  const schemas = [true, {}, ...['a', 'b'].map(value => ({
    if: { properties: { kind: { const: value } }, required: [] },
    then: true,
    else: false
  }))]
  const ajv = new Ajv({ strict: false })
  const original = ajv.compile({ allOf: schemas })
  const merged = ajv.compile(mergeSchemas(schemas, options))
  for (const input of [{}, { kind: 'a' }, { kind: 'b' }, { kind: 'c' }, null]) {
    assert.equal(merged(input), original(input))
  }
  const nullBranch = { if: { properties: { kind: { const: 'a' } } }, then: { const: null } }
  const emptyBranch = { if: { properties: { kind: { const: 'b' } } }, then: {} }
  assert.equal(ajv.compile(mergeSchemas([nullBranch, emptyBranch], options))(null), true)
})
