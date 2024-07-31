import { Chunk } from "./Chunk"
import { HEADER_LENGTH, TYPE_LENGTH } from "./constants"
import { concatUint8Arrays } from "uint8array-extras";

function assertsArrayBufferLike(value: unknown): asserts value is ArrayBufferLike {
  if (value != null && (value instanceof ArrayBuffer || ArrayBuffer.isView(value))) {
    return
  }

  throw new TypeError(
    'Expectd ArrayBuffer | ArrayBufferView, but got:' +
    Object.prototype.toString.call(value)
  )
}

export class IFFTransformStream<T = any> extends TransformStream<ArrayBuffer, T> {
  #buffer = new Uint8Array()

  constructor(transformer?: Transformer<Chunk, T>) {
    super({
      ...transformer,
      transform: async (_chunk, controller) => {
        assertsArrayBufferLike(_chunk)

        // Append new chunk to the buffer
        this.#buffer = concatUint8Arrays([this.#buffer, new Uint8Array(_chunk)])

        while (this.#buffer.length >= HEADER_LENGTH) {
          const size = Number(new DataView(this.#buffer.buffer).getBigUint64(TYPE_LENGTH))
          const chunkSize = size + HEADER_LENGTH

          // Not enough data to process the chunk
          if (this.#buffer.length < chunkSize) {
            break;
          }

          const chunkData = this.#buffer.subarray(0, chunkSize)
          const headerBuffer = chunkData.subarray(0, HEADER_LENGTH)
          const identifier = new TextDecoder().decode(headerBuffer.subarray(0, TYPE_LENGTH))

          const chunk = new Chunk(identifier, [chunkData.subarray(HEADER_LENGTH)])

          await transformer?.transform?.(chunk, controller)

          // Remove the processed chunk from the buffer
          this.#buffer = this.#buffer.slice(chunkSize)
        }
      },
    })
  }
}