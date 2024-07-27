import { TYPE_LENGTH } from "./constants";

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

export class Chunk extends Blob {
  readonly identifier: string

  constructor(
    blobParts: BlobPart[],
    options: BlobPropertyBag & { identifier: string }
  ) {
    const { identifier, ...rest} = options

    super(blobParts, rest)

    validateIdentifier(identifier)
    this.identifier = identifier
  }
}