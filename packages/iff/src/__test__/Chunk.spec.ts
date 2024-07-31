import { areUint8ArraysEqual } from "uint8array-extras";
import { Chunk, RawChunk } from "../Chunk";

describe('Chunk', () => {
  it('should validate identifier', async () => {
    expect(() => new Chunk(undefined as unknown as string)).toThrow()
    expect(() => new Chunk('')).toThrow()
    expect(() => new Chunk('abc')).toThrow()
    expect(() => new Chunk('abcd')).not.toThrow()
    expect(() => new Chunk('abcde')).toThrow()
    expect(() => new Chunk('££££')).toThrow()
    expect(() => new Chunk('中文中文')).toThrow()
  })

  it('should be instance of Blob', () => {
    expect(new Chunk('WAVE')).toBeInstanceOf(Blob)
  })

  test('identifier', async () => {
    const identifier = 'WAVE'
    expect(new Chunk(identifier).identifier).toBe(identifier)
  })
})

test('RawChunk', async () => {
  const length = 10
  const buffer = crypto.getRandomValues(new Uint8Array(length))
  const chunk = new RawChunk('WARE', [buffer])

  expect(chunk.size).toBe(length + 12)
  expect(new TextDecoder().decode(await chunk.slice(0, 4).arrayBuffer())).toBe('WARE')
  expect(
    areUint8ArraysEqual(
      buffer,
      new Uint8Array(await chunk.slice(12).arrayBuffer())
    )
  ).toBeTruthy()
})