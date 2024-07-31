import { areUint8ArraysEqual, concatUint8Arrays } from "uint8array-extras";
import { Chunk, RawChunk } from "../Chunk";

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

  test('header', async () => {
    const identifier = 'WARE'
    const data = new Uint8Array(10)
    const sizeBuffer = new ArrayBuffer(8)
    const chunk = new Chunk([data], { identifier })

    new DataView(sizeBuffer).setBigUint64(0, BigInt(data.length))

    expect(
      areUint8ArraysEqual(
        new Uint8Array(chunk.header),
        concatUint8Arrays([
          new TextEncoder().encode(identifier),
          new Uint8Array(sizeBuffer),
        ])
      )
    ).toBeTruthy()
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