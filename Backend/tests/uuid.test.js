const { parseUuid } = require('../src/utils/uuid')

describe('UUID utils', () => {
  it('parseUuid accepts valid UUID', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000'
    expect(parseUuid(id)).toBe(id)
  })

  it('parseUuid rejects invalid UUID', () => {
    expect(() => parseUuid('123')).toThrow('Invalid id')
  })
})
