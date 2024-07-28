import { Chunk } from "./Chunk"
import { HEADER_LENGTH, TYPE_LENGTH } from "./constants"
import { concatUint8Arrays } from "uint8array-extras";

export class IFFTransformStream<T = any> extends TransformStream<Uint8Array, T> {
  #buffer = new Uint8Array()

  constructor(transformer?: Transformer<Chunk, T>) {
    super({
      ...transformer,
      transform: async (_chunk, controller) => {
        // Append new chunk to the buffer
        this.#buffer = concatUint8Arrays([this.#buffer, _chunk])

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

          const chunk = new Chunk([chunkData.subarray(HEADER_LENGTH)], { identifier })

          await transformer?.transform?.(chunk, controller)

          // Remove the processed chunk from the buffer
          this.#buffer = this.#buffer.slice(chunkSize)
        }
      },
    })
  }
}