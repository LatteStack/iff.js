import { Chunk } from "./Chunk";

const TYPE_LENGTH = 4
const SIZE_LENGTH = BigUint64Array.BYTES_PER_ELEMENT
const HEADER_LENGTH = TYPE_LENGTH + SIZE_LENGTH

export class IFF extends Array<Chunk> {
  constructor(...chunks: Chunk[]) {
    super(...chunks)
  }

  blob(): Blob {
    const createIdentifier = (identifier: string): Uint8Array => {
      const buffer = new Uint8Array(TYPE_LENGTH)
      const identifierBuffer = new TextEncoder().encode(identifier)
      buffer.set(
        identifierBuffer.length <= TYPE_LENGTH
          ? identifierBuffer
          : identifierBuffer.subarray(0, TYPE_LENGTH)
      )
      return buffer
    }

    const createSize = (size: number): Uint8Array => {
      const buffer = new ArrayBuffer(SIZE_LENGTH)
      new DataView(buffer).setBigUint64(0, BigInt(size))
      return new Uint8Array(buffer)
    }

    const createBlobPart = (chunk: Chunk) => ([
      createIdentifier(chunk.identifier),
      createSize(chunk.size),
      chunk
    ])

    const blobParts: BlobPart[] = this
      .map(createBlobPart)
      .flat()

    return new Blob(blobParts)
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return this.blob().arrayBuffer()
  }

  stream(): ReadableStream<Uint8Array> {
    return this.blob().stream()
  }
  
  static async parse(blobPart: BlobPart): Promise<IFF> {
    const blob = new Blob([blobPart])
    const chunks: Chunk[] = []

    let offset = 0

    const readChunk = (size: number, identifier = ''): Chunk => {
      const chunk = new Chunk([blob.slice(offset, offset + size)], { identifier })
      offset += size
      return chunk
    }

    const getIdentifier = (header: ArrayBuffer): string => {
      return new TextDecoder().decode(
        new Uint8Array(header, 0, TYPE_LENGTH)
      )
    }

    const getSize = (header: ArrayBuffer): number => {
      return Number(
        new DataView(header, TYPE_LENGTH).getBigUint64(0)
      )
    }

    while (offset < blob.size) {
      const header = await readChunk(HEADER_LENGTH).arrayBuffer()
      const size = getSize(header)
      const identifier = getIdentifier(header)
      const chunk = readChunk(size, identifier)
      chunks.push(chunk)
    }

    return new IFF(...chunks)
  }
}
