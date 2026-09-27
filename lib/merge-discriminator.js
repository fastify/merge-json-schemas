'use strict'

function containsDefaultOrRef (schema) {
  if (schema === null || typeof schema !== 'object') return false
  return Object.entries(schema).some(([key, value]) =>
    ['default', '$ref', '$dynamicRef', '$recursiveRef', '$id'].includes(key) || containsDefaultOrRef(value)
  )
}

function mergeDiscriminator (schemas, merge) {
  const entries = []
  let propertyName
  let propertyType
  let requiresProperty
  let requiresObject

  for (const schema of schemas) {
    if (schema.if === undefined) continue
    if (containsDefaultOrRef(schema.then) || containsDefaultOrRef(schema.else)) return
    const condition = schema.if
    if (condition === null || typeof condition !== 'object' || Array.isArray(condition)) return
    if (Object.keys(condition).some(key => !['type', 'properties', 'required'].includes(key))) return
    if (condition.type !== undefined && condition.type !== 'object') return
    if (!condition.properties || typeof condition.properties !== 'object' || Array.isArray(condition.properties)) return

    const keys = Object.keys(condition.properties)
    if (keys.length !== 1) return
    const key = keys[0]
    const property = condition.properties[key]
    if (property === null || typeof property !== 'object' || Array.isArray(property)) return
    if (!Object.hasOwn(property, 'const') || Object.keys(property).some(key => !['type', 'const'].includes(key))) return
    if (property.type !== undefined && !['string', 'number', 'integer', 'boolean', 'null'].includes(property.type)) return
    const value = property.const
    if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) return
    if (typeof value === 'number' && !Number.isFinite(value)) return

    const required = condition.required
    if (required !== undefined && (!Array.isArray(required) || required.length > 1 || (required.length === 1 && required[0] !== key))) return
    const needsProperty = required !== undefined && required.length === 1
    const needsObject = condition.type === 'object'

    if (entries.length === 0) {
      propertyName = key
      propertyType = property.type
      requiresProperty = needsProperty
      requiresObject = needsObject
    } else if (key !== propertyName || property.type !== propertyType || needsProperty !== requiresProperty || needsObject !== requiresObject) {
      return
    }
    entries.push({ schema, value })
  }
  if (entries.length < 2) return

  const groups = new Map()
  for (const entry of entries) groups.set(entry.value, entry.schema.if)
  const mergeBranch = matches => merge(entries.map(entry =>
    (matches(entry) ? entry.schema.then : entry.schema.else) ?? {}
  ))

  let chain = mergeBranch(() => false)
  for (const [value, condition] of [...groups].reverse()) {
    chain = {
      if: condition,
      then: mergeBranch(entry => entry.value === value),
      else: chain
    }
  }

  // Without a discriminator, properties-only conditions can all match.
  const missingProperty = mergeBranch(() => !requiresProperty)
  const presentProperty = {
    // Negation tests presence without annotating the discriminator as evaluated.
    if: { type: 'object', not: { properties: { [propertyName]: false } } },
    then: chain,
    else: missingProperty
  }
  if (requiresProperty === requiresObject) return presentProperty

  return {
    if: { type: 'object' },
    then: presentProperty,
    else: mergeBranch(() => !requiresObject)
  }
}

module.exports = mergeDiscriminator
