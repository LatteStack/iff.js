import { Chunk } from "./Chunk";

describe('Chunk', () => {
  it('should validate identifier', async () => {
    expect(() => new Chunk([], { identifier: undefined as unknown as string })).toThrow()
    expect(() => new Chunk([], { identifier: '' })).toThrow()
    expect(() => new Chunk([], { identifier: 'abc' })).toThrow()
    expect(() => new Chunk([], { identifier: 'abcd' })).not.toThrow()
    expect(() => new Chunk([], { identifier: 'abcde' })).toThrow()
    expect(() => new Chunk([], { identifier: '££££' })).toThrow()
    expect(() => new Chunk([], { identifier: '中文中文' })).toThrow()
  })

  it('should be instance of Blob', () => {
    expect(new Chunk([], { identifier: 'WAVE' })).toBeInstanceOf(Blob)
  })

  test('identifier', async () => {
    const identifier = 'WAVE'
    expect(new Chunk([], { identifier }).identifier).toBe(identifier)
  })
})