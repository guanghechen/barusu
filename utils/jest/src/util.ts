/**
 * Remove volatile contents
 *
 * @param content
 */
export function desensitize(
  content: string,
  workspaceRootDir: string
): string {
  return content
    .replace(workspaceRootDir, '<workspaceRootDir>')
    .replace(/\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}/, '$1<Date>')
}
