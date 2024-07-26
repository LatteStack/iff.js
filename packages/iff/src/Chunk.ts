export class Chunk extends Blob {
  readonly identifier: string

  constructor(
    blobParts: BlobPart[],
    options: BlobPropertyBag & { identifier: string }
  ) {
    const { identifier, ...rest} = options
    super(blobParts, rest)
    this.identifier = identifier
  }
}