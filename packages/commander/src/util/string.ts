/**
 * Pad `str` to `width`.
 *
 * @param str
 * @param width
 */

export function padLeft(str: string, width: number): string {
  const len = Math.max(0, width - str.length)
  return str + Array(len + 1).join(' ')
}

/**
 * Wraps the given string with line breaks at the specified width while breaking
 * words and indenting every but the first line on the left.
 *
 * @param str
 * @param width
 * @param indent
 */
export function wrap(str: string, width: number, indent = 0): string {
  const regex = new RegExp(
    '.{1,' + (width - 1) + '}([\\s\u200B]|$)|[^\\s\u200B]+?([\\s\u200B]|$)',
    'g',
  )
  const lines = str.match(regex) || []
  const formatted = lines
    .map((line: string, i: number) => {
      if (line.slice(-1) === '\n') {
        // eslint-disable-next-line no-param-reassign
        line = line.slice(0, line.length - 1)
      }
      const pad: string = i > 0 && indent > 0 ? Array(indent + 1).join(' ') : ''
      return pad + line.trimRight()
    })
    .join('\n')
  return formatted
}

/**
 * Optionally wrap the given str to a max width of width characters per line
 * while indenting with indent spaces. Do not wrap if insufficient width or
 * string is manually formatted.
 *
 * @param str
 * @param width
 * @param indent
 */
export function optionalWrap(
  str: string,
  width: number,
  indent?: number,
): string {
  // Detect manually wrapped and indented strings by searching for line breaks
  // followed by multiple spaces/tabs.
  if (str.match(/[\n]\s+/)) return str

  // Do not wrap to narrow columns (or can end up with a word per line).
  const minWidth = 40
  if (width < minWidth) return str

  return wrap(str, width, indent)
}
