import { HEADER_LENGTH, SIZE_LENGTH, TYPE_LENGTH } from "./constants";

const MAX_ASCII = 127

function validateIdentifier(identifier: unknown): asserts identifier is string {
  if (typeof identifier !== 'string') {
    throw new Error(`identifier must be string.`)
  }

  if (identifier.length !== TYPE_LENGTH) {
    throw new Error(`identifier must be ${TYPE_LENGTH} bytes.`)
  }

  for (let index = 0; index < identifier.length; index++) {
    if (identifier.charCodeAt(index) > MAX_ASCII) {
      throw new Error('identifier must be ASCII characters.')
    }
  }
}

function createIdentifierBuffer(identifier: string): Uint8Array {
  return new TextEncoder().encode(identifier)
}

function createSizeBuffer(size: number): Uint8Array {
  const buffer = new ArrayBuffer(SIZE_LENGTH)
  new DataView(buffer).setBigUint64(0, BigInt(size))
  return new Uint8Array(buffer)
}

export class Chunk extends Blob {
  readonly identifier: string

  get header(): Uint8Array {
    const buffer = new Uint8Array(HEADER_LENGTH)
    buffer.set(createIdentifierBuffer(this.identifier))
    buffer.set(createSizeBuffer(this.size), TYPE_LENGTH)
    return buffer
  }

  constructor(
    blobParts: BlobPart[],
    options: BlobPropertyBag & { identifier: string }
  ) {
    const { identifier, ...rest} = options
    validateIdentifier(identifier)

    super(blobParts, rest)
    this.identifier = identifier
  }
}