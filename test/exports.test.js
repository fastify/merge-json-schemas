const { resolvers } = require('../index')
const assert = require('node:assert/strict')
const { test } = require('node:test')

test('Exported resolvers: should export all expected resolvers', () => {
  assert(Object.prototype.hasOwnProperty.call(resolvers, 'arraysIntersection'))
  assert(Object.prototype.hasOwnProperty.call(resolvers, 'hybridArraysIntersection'))
  assert(Object.prototype.hasOwnProperty.call(resolvers, 'arraysUnion'))
  assert(Object.prototype.hasOwnProperty.call(resolvers, 'minNumber'))
  assert(Object.prototype.hasOwnProperty.call(resolvers, 'maxNumber'))
  assert(Object.prototype.hasOwnProperty.call(resolvers, 'commonMultiple'))
  assert(Object.prototype.hasOwnProperty.call(resolvers, 'allEqual'))
  assert(Object.prototype.hasOwnProperty.call(resolvers, 'booleanAnd'))
  assert(Object.prototype.hasOwnProperty.call(resolvers, 'booleanOr'))
  assert(Object.prototype.hasOwnProperty.call(resolvers, 'skip'))
})

test('Exported resolvers: should ensure each resolver is a function', () => {
  Object.values(resolvers).forEach((resolver) => {
    assert.strictEqual(typeof resolver, 'function')
  })
})
