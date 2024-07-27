import { IFF } from "./IFF";
import { Chunk } from "./Chunk";
import { randomBytes, randomInt, randomUUID } from "node:crypto";

function areUint8ArraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false

  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) {
      return false
    }
  }

  return true
}

describe('IFF', () => {
  function createMockChunk(length: number, identifier?: string): Chunk
  function createMockChunk(content: ArrayBuffer, identifier?: string): Chunk
  function createMockChunk(lengthOrContent: number | ArrayBuffer, identifier = 'WARE'): Chunk {
    const content = typeof lengthOrContent === 'number'
      ? new Uint8Array(randomBytes(lengthOrContent))
      : lengthOrContent

    return new Chunk([content], { identifier });
  }

  test('blob', async () => {
    expect(new IFF(createMockChunk(0)).blob()).toBeInstanceOf(Blob)
    expect(new IFF(createMockChunk(0)).blob().size).toBe(12)
    expect(new IFF(createMockChunk(10)).blob().size).toBe(22)
    expect(new IFF(createMockChunk(10), createMockChunk(10)).blob().size).toBe(44)
  })

  test('arrayBuffer', async () => {
    expect(new IFF(createMockChunk(0)).arrayBuffer()).resolves.toBeInstanceOf(ArrayBuffer)
  })

  test('stream', async () => {
    expect(new IFF(createMockChunk(0)).stream()).toBeInstanceOf(ReadableStream)
  })

  describe('parse', () => {
    it('should handle empty chunks', async () => {
      expect(IFF.parse(new ArrayBuffer(0))).resolves.not.toThrow()
      expect(IFF.parse(new ArrayBuffer(0))).resolves.toHaveLength(0)
    })

    it('should correctly read a file with multiple chunks', async () => {
      const chunks = Array.from({ length: 1000 }, () => {
        return createMockChunk(randomInt(0, 1000), randomUUID().slice(-4))
      })

      const iff = await IFF.parse(new IFF(...chunks).blob())

      expect(iff.length).toBe(chunks.length)

      for (const [index, actual] of iff.entries()) {
        const excepted = chunks[index]
        expect(actual.size).toBe(excepted.size)
        expect(actual.identifier).toBe(excepted.identifier)
        expect(areUint8ArraysEqual(
          new Uint8Array(await actual.arrayBuffer()),
          new Uint8Array(await excepted.arrayBuffer()),
        )).toBeTruthy()
      }
    })
  })
})