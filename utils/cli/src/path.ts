import path from 'path'


/**
 * Calc relative path to workspace
 *
 * @param workspace
 * @param targetDir
 */
export function relativeOfWorkspace(workspace: string, targetDir: string): string {
  const absoluteDir = path.resolve(workspace, targetDir)
  const relativeDir = path.relative(workspace, absoluteDir)
  return path.normalize(relativeDir )
}
