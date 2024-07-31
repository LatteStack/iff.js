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

function createHeader(identifier: string, size: number): Uint8Array {
  const buffer = new Uint8Array(HEADER_LENGTH)
  buffer.set(createIdentifierBuffer(identifier))
  buffer.set(createSizeBuffer(size), TYPE_LENGTH)
  return buffer
}

export class Chunk extends Blob {
  readonly identifier: string

  get header(): Uint8Array {
    return createHeader(this.identifier, this.size)
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

export class RawChunk extends Blob {
  constructor(identifier: string, blobParts?: BlobPart[]) {
    validateIdentifier(identifier)

    const data = new Blob(blobParts)
    const header = createHeader(identifier, data.size)

    super([header, data])
  }
}