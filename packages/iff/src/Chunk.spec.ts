import { Chunk } from "./Chunk";

describe('Chunk', () => {
  it('should be instance of Blob', () => {
    expect(new Chunk([], { identifier: '' })).toBeInstanceOf(Blob)
  })

  test('identifier', async () => {
    const identifier = 'WAVE'
    expect(new Chunk([], { identifier }).identifier).toBe(identifier)
  })
})