'use strict'

const assert = require('node:assert/strict')
const { test } = require('node:test')
const { mergeSchemas } = require('../index')
const { defaultResolver } = require('./utils')

test('should merge empty schema and if/then/else keywords', () => {
  const schema1 = {}
  const schema2 = {
    if: {
      type: 'string',
      const: 'foo'
    },
    then: {
      type: 'string',
      const: 'bar'
    },
    else: {
      type: 'string',
      const: 'baz'
    }
  }

  const mergedSchema = mergeSchemas([schema1, schema2], { defaultResolver })
  assert.deepStrictEqual(mergedSchema, {
    if: {
      type: 'string',
      const: 'foo'
    },
    then: {
      type: 'string',
      const: 'bar'
    },
    else: {
      type: 'string',
      const: 'baz'
    }
  })
})

test('should merge  if/then/else schema with an empty schema', () => {
  const schema1 = {
    if: {
      type: 'string',
      const: 'foo'
    },
    then: {
      type: 'string',
      const: 'bar'
    },
    else: {
      type: 'string',
      const: 'baz'
    }
  }
  const schema2 = {}

  const mergedSchema = mergeSchemas([schema1, schema2], { defaultResolver })
  assert.deepStrictEqual(mergedSchema, {
    if: {
      type: 'string',
      const: 'foo'
    },
    then: {
      type: 'string',
      const: 'bar'
    },
    else: {
      type: 'string',
      const: 'baz'
    }
  })
})

test('should merge two if/then/else schemas', () => {
  const schema1 = {
    type: 'object',
    if: {
      properties: {
        foo1: { type: 'string', const: 'foo1' }
      }
    },
    then: {
      properties: {
        bar1: { type: 'string', const: 'bar1' }
      }
    },
    else: {
      properties: {
        baz1: { type: 'string', const: 'baz1' }
      }
    }
  }
  const schema2 = {
    type: 'object',
    if: {
      properties: {
        foo2: { type: 'string', const: 'foo2' }
      }
    },
    then: {
      properties: {
        bar2: { type: 'string', const: 'bar2' }
      }
    },
    else: {
      properties: {
        baz2: { type: 'string', const: 'baz2' }
      }
    }
  }

  const mergedSchema = mergeSchemas([schema1, schema2], { defaultResolver })
  assert.deepStrictEqual(mergedSchema, {
    type: 'object',
    if: {
      properties: {
        foo1: { type: 'string', const: 'foo1' }
      }
    },
    then: {
      properties: {
        bar1: { type: 'string', const: 'bar1' }
      },
      if: {
        properties: {
          foo2: { type: 'string', const: 'foo2' }
        }
      },
      then: {
        properties: {
          bar2: { type: 'string', const: 'bar2' }
        }
      },
      else: {
        properties: {
          baz2: { type: 'string', const: 'baz2' }
        }
      }
    },
    else: {
      properties: {
        baz1: { type: 'string', const: 'baz1' }
      },
      if: {
        properties: {
          foo2: { type: 'string', const: 'foo2' }
        }
      },
      then: {
        properties: {
          bar2: { type: 'string', const: 'bar2' }
        }
      },
      else: {
        properties: {
          baz2: { type: 'string', const: 'baz2' }
        }
      }
    }
  })
})

test('should merge three if/then/else schemas', () => {
  const schema1 = {
    type: 'object',
    if: {
      properties: {
        foo1: { type: 'string', const: 'foo1' }
      }
    },
    then: {
      properties: {
        bar1: { type: 'string', const: 'bar1' }
      }
    },
    else: {
      properties: {
        baz1: { type: 'string', const: 'baz1' }
      }
    }
  }
  const schema2 = {
    type: 'object',
    if: {
      properties: {
        foo2: { type: 'string', const: 'foo2' }
      }
    },
    then: {
      properties: {
        bar2: { type: 'string', const: 'bar2' }
      }
    },
    else: {
      properties: {
        baz2: { type: 'string', const: 'baz2' }
      }
    }
  }
  const schema3 = {
    type: 'object',
    if: {
      properties: {
        foo3: { type: 'string', const: 'foo3' }
      }
    },
    then: {
      properties: {
        bar3: { type: 'string', const: 'bar3' }
      }
    },
    else: {
      properties: {
        baz3: { type: 'string', const: 'baz3' }
      }
    }
  }

  const mergedSchema = mergeSchemas([schema1, schema2, schema3], { defaultResolver })
  assert.deepStrictEqual(mergedSchema, {
    type: 'object',
    if: {
      properties: {
        foo1: { type: 'string', const: 'foo1' }
      }
    },
    then: {
      properties: {
        bar1: { type: 'string', const: 'bar1' }
      },
      if: {
        properties: {
          foo2: { type: 'string', const: 'foo2' }
        }
      },
      then: {
        properties: {
          bar2: { type: 'string', const: 'bar2' }
        },
        if: {
          properties: {
            foo3: { type: 'string', const: 'foo3' }
          }
        },
        then: {
          properties: {
            bar3: { type: 'string', const: 'bar3' }
          }
        },
        else: {
          properties: {
            baz3: { type: 'string', const: 'baz3' }
          }
        }
      },
      else: {
        properties: {
          baz2: { type: 'string', const: 'baz2' }
        },
        if: {
          properties: {
            foo3: { type: 'string', const: 'foo3' }
          }
        },
        then: {
          properties: {
            bar3: { type: 'string', const: 'bar3' }
          }
        },
        else: {
          properties: {
            baz3: { type: 'string', const: 'baz3' }
          }
        }
      }
    },
    else: {
      properties: {
        baz1: { type: 'string', const: 'baz1' }
      },
      if: {
        properties: {
          foo2: { type: 'string', const: 'foo2' }
        }
      },
      then: {
        properties: {
          bar2: { type: 'string', const: 'bar2' }
        },
        if: {
          properties: {
            foo3: { type: 'string', const: 'foo3' }
          }
        },
        then: {
          properties: {
            bar3: { type: 'string', const: 'bar3' }
          }
        },
        else: {
          properties: {
            baz3: { type: 'string', const: 'baz3' }
          }
        }
      },
      else: {
        properties: {
          baz2: { type: 'string', const: 'baz2' }
        },
        if: {
          properties: {
            foo3: { type: 'string', const: 'foo3' }
          }
        },
        then: {
          properties: {
            bar3: { type: 'string', const: 'bar3' }
          }
        },
        else: {
          properties: {
            baz3: { type: 'string', const: 'baz3' }
          }
        }
      }
    }
  })
})

test('should two if/then keyword schemas', () => {
  const schema1 = {
    type: 'object',
    if: {
      properties: {
        foo1: { type: 'string', const: 'foo1' }
      }
    },
    then: {
      properties: {
        bar1: { type: 'string', const: 'bar1' }
      }
    }
  }

  const schema2 = {
    type: 'object',
    if: {
      properties: {
        foo2: { type: 'string', const: 'foo2' }
      }
    },
    then: {
      properties: {
        bar2: { type: 'string', const: 'bar2' }
      }
    }
  }

  const mergedSchema = mergeSchemas([schema1, schema2], { defaultResolver })
  assert.deepStrictEqual(mergedSchema, {
    type: 'object',
    if: {
      properties: {
        foo1: { type: 'string', const: 'foo1' }
      }
    },
    then: {
      properties: {
        bar1: { type: 'string', const: 'bar1' }
      },
      if: {
        properties: {
          foo2: { type: 'string', const: 'foo2' }
        }
      },
      then: {
        properties: {
          bar2: { type: 'string', const: 'bar2' }
        }
      }
    },
    else: {
      if: schema2.if,
      then: schema2.then
    }
  })
})

test('should two if/else keyword schemas', () => {
  const schema1 = {
    type: 'object',
    if: {
      properties: {
        foo1: { type: 'string', const: 'foo1' }
      }
    },
    else: {
      properties: {
        bar1: { type: 'string', const: 'bar1' }
      }
    }
  }

  const schema2 = {
    type: 'object',
    if: {
      properties: {
        foo2: { type: 'string', const: 'foo2' }
      }
    },
    else: {
      properties: {
        bar2: { type: 'string', const: 'bar2' }
      }
    }
  }

  const mergedSchema = mergeSchemas([schema1, schema2], { defaultResolver })
  assert.deepStrictEqual(mergedSchema, {
    type: 'object',
    if: {
      properties: {
        foo1: { type: 'string', const: 'foo1' }
      }
    },
    then: {
      if: schema2.if,
      else: schema2.else
    },
    else: {
      properties: {
        bar1: { type: 'string', const: 'bar1' }
      },
      if: {
        properties: {
          foo2: { type: 'string', const: 'foo2' }
        }
      },
      else: {
        properties: {
          bar2: { type: 'string', const: 'bar2' }
        }
      }
    }
  })
})

test('should two if/then and if/else keyword schemas', () => {
  const schema1 = {
    type: 'object',
    if: {
      properties: {
        foo1: { type: 'string', const: 'foo1' }
      }
    },
    then: {
      properties: {
        bar1: { type: 'string', const: 'bar1' }
      }
    }
  }

  const schema2 = {
    type: 'object',
    if: {
      properties: {
        foo2: { type: 'string', const: 'foo2' }
      }
    },
    else: {
      properties: {
        bar2: { type: 'string', const: 'bar2' }
      }
    }
  }

  const mergedSchema = mergeSchemas([schema1, schema2], { defaultResolver })
  assert.deepStrictEqual(mergedSchema, {
    type: 'object',
    if: {
      properties: {
        foo1: { type: 'string', const: 'foo1' }
      }
    },
    then: {
      properties: {
        bar1: { type: 'string', const: 'bar1' }
      },
      if: {
        properties: {
          foo2: { type: 'string', const: 'foo2' }
        }
      },
      else: {
        properties: {
          bar2: { type: 'string', const: 'bar2' }
        }
      }
    },
    else: {
      if: schema2.if,
      else: schema2.else
    }
  })
})

test('should two if/else and if/then keyword schemas', () => {
  const schema1 = {
    type: 'object',
    if: {
      properties: {
        foo1: { type: 'string', const: 'foo1' }
      }
    },
    else: {
      properties: {
        bar1: { type: 'string', const: 'bar1' }
      }
    }
  }

  const schema2 = {
    type: 'object',
    if: {
      properties: {
        foo2: { type: 'string', const: 'foo2' }
      }
    },
    then: {
      properties: {
        bar2: { type: 'string', const: 'bar2' }
      }
    }
  }

  const mergedSchema = mergeSchemas([schema1, schema2], { defaultResolver })
  assert.deepStrictEqual(mergedSchema, {
    type: 'object',
    if: {
      properties: {
        foo1: { type: 'string', const: 'foo1' }
      }
    },
    then: {
      if: schema2.if,
      then: schema2.then
    },
    else: {
      properties: {
        bar1: { type: 'string', const: 'bar1' }
      },
      if: {
        properties: {
          foo2: { type: 'string', const: 'foo2' }
        }
      },
      then: {
        properties: {
          bar2: { type: 'string', const: 'bar2' }
        }
      }
    }
  })
})

test('should preserve later conditions when the first if has no branches', () => {
  const schema1 = { if: { const: 'foo' } }
  const schema2 = {
    if: { type: 'string' },
    then: { minLength: 3 },
    else: { minimum: 3 }
  }
  const originalSchemas = JSON.stringify([schema1, schema2])

  assert.deepStrictEqual(mergeSchemas([schema1, schema2]), {
    if: schema1.if,
    then: schema2,
    else: schema2
  })
  assert.equal(JSON.stringify([schema1, schema2]), originalSchemas)
})

test('should preserve false branches when merging later conditions', () => {
  const schema1 = {
    if: { const: 'foo' },
    then: false,
    else: false
  }
  const schema2 = {
    if: { type: 'string' },
    then: { minLength: 3 }
  }

  assert.deepStrictEqual(mergeSchemas([schema1, schema2]), schema1)
})

test('should not attach orphan then and else to another schema condition', () => {
  const schema1 = {
    if: { const: 'foo' },
    then: { type: 'string' }
  }
  const schema2 = {
    if: { const: 'bar' },
    then: { minLength: 3 }
  }

  assert.deepStrictEqual(
    mergeSchemas([schema1, { then: false, else: false }, schema2]),
    mergeSchemas([schema1, schema2])
  )
})
