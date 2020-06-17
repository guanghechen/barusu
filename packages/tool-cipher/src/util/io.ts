import { destroyBuffer, destroyBuffers } from './buffer'


/**
 * Get data from stdin
 */
export function input(
  question: string,
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const stdin = process.stdin
    const stdout = process.stdout
    const chunks: Buffer[] = []

    // on fulfilled
    const onResolved = () => {
      const data = Buffer.concat(chunks)
      destroyBuffers(chunks)
      resolve(data)
    }

    // on rejected
    const onRejected = (error: any) => {
      destroyBuffers(chunks)
      reject(error)
    }

    stdin.resume()
    stdin.setRawMode(true)
    stdout.write(question + ': ')

    stdin.on('readable', function () {
      let chunk: Buffer
      while ((chunk = stdin.read()) != null) {
        // test whether is a valid character
        const isValidCharacter = (i: number) => {
          if (chunk[i] < 1 || chunk[i] > 127) return false
          return true
        }

        let size = 0
        const collectCharacters = () => {
          if (size > 0) {
            const chunkPiece = Buffer.alloc(size)
            for (let i = 0, j = 0; i < chunk.length && j < size; ++i) {
              if (isValidCharacter(i)) {
                chunkPiece[j++] = chunk[i]
              }
            }
            chunks.push(chunkPiece)
          }
          destroyBuffer(chunk)
        }

        for (let i = 0; i < chunk.length; ++i) {
          if (chunk[i] < 1 || chunk[i] > 127) continue
          if (
            chunk[i] === 4 ||
            chunk[i] === 10 ||
            chunk[i] === 13
          ) {
            stdout.write('\n')
            stdin.setRawMode(false)
            stdin.emit('end')
            collectCharacters()
            return
          }

          if (isValidCharacter(i)) {
            ++size
            stdout.write('*')
          }
        }

        collectCharacters()
      }
    })

    stdin.on('end', function () {
      onResolved()
    })

    stdin.on('error', function (error) {
      onRejected(error)
    })
  })
}
