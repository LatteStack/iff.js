import { areUint8ArraysEqual } from "uint8array-extras";
import { Chunk } from "../Chunk";
import { IFFTransformStream } from "../IFFTransformStream";
import { randomUUID, randomInt, randomBytes } from "node:crypto";
import { IFF } from "../IFF";

describe('IFFTransformStream', () => {
  it('should correctly transform a stream with multiple chunks', async () => {
    const chunks = Array.from({ length: 1000 }, () => {
      return new Chunk(randomUUID().slice(-4), [new Uint8Array(randomBytes(randomInt(0, 1000)))])
    })

    let index = 0

    // Prevent overfitting.
    const data = await new IFF(...chunks).arrayBuffer()

    await new Blob([data]).stream()
      .pipeThrough(new IFFTransformStream({
        transform: async (actual) => {
          const excepted = chunks[index++]
          expect(actual.size).toBe(excepted.size)
          expect(actual.identifier).toBe(excepted.identifier)
          expect(areUint8ArraysEqual(
            new Uint8Array(await actual.arrayBuffer()),
            new Uint8Array(await excepted.arrayBuffer()),
          )).toBeTruthy()
        }
      }))
      .pipeTo(new WritableStream({
        write: () => void 0
      }))
  })
})