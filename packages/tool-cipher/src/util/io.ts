import { isNotEmptyString } from '@barusu/option-util'
import { destroyBuffer } from './buffer'
import { CustomError, ERROR_CODE } from './error'


/**
 * @param question
 * @param isValidCharacter
 * @param showAsterisk
 */
export function inputOneLine(
  question?: string,
  isValidCharacter?: (c: number) => boolean,
  showAsterisk = true,
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const stdin = process.stdin
    const stdout = process.stdout
    let chunkAcc: Buffer | null = null

    // on fulfilled
    const onResolved = () => {
      stdin.removeListener('data', onData)
      stdin.removeListener('end', onResolved)
      stdin.removeListener('error', onRejected)
      resolve(chunkAcc!)
    }

    // on rejected
    const onRejected = (error: any) => {
      stdin.removeListener('data', onData)
      stdin.removeListener('end', onResolved)
      stdin.removeListener('error', onRejected)
      destroyBuffer(chunkAcc)
      reject(error)
    }

    // on data
    const onData = (chunk: Buffer) => {
      let pieceTot: number = chunkAcc == null ? 0 : chunkAcc.length
      const piece: Buffer = chunkAcc == null ? chunk : Buffer.concat([chunkAcc, chunk])
      for (let i = 0; i < chunk.length; ++i) {
        switch (chunk[i]) {
          case 0x03:  // Ctrl-c
            stdin.emit('error', {
              code: ERROR_CODE.CANCELED,
              message: 'cancelled (ctrl-c)',
            })
            break
          case 0x7f:  // Backspace
            if (pieceTot > 0) {
              pieceTot -= 1
              stdout.moveCursor(-1, 0)
              stdout.clearLine(1)
            }
            break
          case 0x04:  // Ctrl-d
          case 0x0a:  // LF  (line feed)
          case 0x0d:  // CR  (carriage return)
            stdout.write('\n')
            stdin.setRawMode(false)
            stdin.pause()
            onResolved()
            return
          default:
            // ignore other invalid characters
            if (isValidCharacter != null && !isValidCharacter(chunk[i])) break

            piece[pieceTot] = chunk[i]
            pieceTot += 1

            if (showAsterisk) {
              stdout.write('*')
            }
        }
      }

      if (pieceTot <= 0) {
        destroyBuffer(chunkAcc)
        chunkAcc = null
      }

      // collect characters
      if (chunkAcc == null || chunkAcc.length !== pieceTot) {
        destroyBuffer(chunkAcc)
        chunkAcc = Buffer.alloc(pieceTot)
      }
      piece.copy(chunkAcc, 0, 0, pieceTot)
      destroyBuffer(piece)
    }

    stdin.resume()
    stdin.setRawMode(true)
    if (isNotEmptyString(question)) {
      stdout.write(question)
    }

    stdin.on('data', onData)
    stdin.on('end', onResolved)
    stdin.on('error', onRejected)
  })
}


/**
 * Get data from stdin
 * @param question
 * @param isValidAnswer
 * @param hintOnInvalidAnswer
 * @param maxRetryTimes
 * @param showAsterisk
 */
export async function input(
  question: string,
  isValidAnswer?: (answer: Buffer | null) => boolean,
  isValidCharacter?: (c: number) => boolean,
  hintOnInvalidAnswer?: (answer: Buffer | null) => string,
  maxRetryTimes = 5,
  showAsterisk = true,
): Promise<Buffer | null> {
  let answer: Buffer | null = null
  for (let i = 0, end = Math.max(0, maxRetryTimes) + 1; i < end; ++i) {
    let questionWithHint: string = question
    if (i > 0 && hintOnInvalidAnswer != null) {
      const hint = hintOnInvalidAnswer(answer)
      if (isNotEmptyString(hint)) {
        questionWithHint = hint
      }
    }

    // destroy previous answer before read new answer
    destroyBuffer(answer)
    answer = null

    answer = await inputOneLine(questionWithHint, isValidCharacter, showAsterisk)
    if (!isValidAnswer || isValidAnswer(answer)) break
  }
  return answer
}


/**
 * Ask for a password from terminal
 * @param showAsterisk
 * @param minimumSize
 * @param question
 */
export async function inputPassword(
  showAsterisk: boolean,
  minimumSize: number,
  question = 'Password: ',
): Promise<Buffer | never> {
  let hint: string
  const isValidPassword = (password: Buffer | null): boolean => {
    if (password == null || password.length < minimumSize) {
      hint = `At least ${ minimumSize } ascii non-space characters needed`
      return false
    }
    if (password.length > 100) {
      hint = 'It\'s too long, do not exceed 100 characters'
      return false
    }
    return true
  }

  const isValidCharacter = (c: number): boolean => {
    // ignore control characters or invalid ascii characters
    if (c <= 0x20 || c >= 0x7F) return false

    // ignore slash and backslash
    if (c === 0x2f || c === 0x5c) return false

    // others are valid
    return true
  }

  const password: Buffer | null = await input(
    question.padStart(20),
    isValidPassword,
    isValidCharacter,
    () => `(${ hint }) ${ question }`,
    3,
    showAsterisk,
  )

  if (password == null) {
    const error: CustomError = {
      code: ERROR_CODE.BAD_PASSWORD,
      message: `too many times failed to get answer of '${ question.replace(/^[\s:]*([\s\S]+?)[\s:]*$/, '$1') }'`,
    }
    throw error
  }

  return password
}


/**
 * Ask for repeat password from terminal
 * @param password
 * @param showAsterisk
 * @param minimumSize
 * @param question
 */
export async function confirmPassword(
  password: Buffer,
  showAsterisk: boolean,
  minimumSize: number,
  question = 'Repeat Password: ',
): Promise<boolean | never> {
  const repeatedPassword: Buffer = await inputPassword(showAsterisk, minimumSize, question)
  const isSame = (): boolean => {
    if (repeatedPassword.length !== password.length) return false
    for (let i = 0; i < password.length; ++i) {
      if (password[i] !== repeatedPassword[i]) return false
    }
    return true
  }

  const result = isSame()
  destroyBuffer(repeatedPassword)
  return result
}
