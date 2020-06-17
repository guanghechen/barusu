/**
 * Fill buffer with a random number
 */
export function destroyBuffer(buffer: Buffer | null): void {
  if (buffer == null) return
  buffer.fill(0)
  buffer.fill(1)
  buffer.fill(Math.random() * 127)
}


/**
 * Destroy buffers
 */
export function destroyBuffers(buffers: (Buffer | null)[]): void {
  for (const buffer of buffers) {
    destroyBuffer(buffer)
  }
}
