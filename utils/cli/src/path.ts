import path from 'path'


/**
 * Calc relative path to workspace
 *
 * @param workspace
 * @param targetDir
 */
export function relativeOfWorkspace(
  workspace: string,
  targetDir?: null,
): undefined
export function relativeOfWorkspace(
  workspace: string,
  targetDir: string,
): string
export function relativeOfWorkspace(
  workspace: string,
  targetDir?: string | null,
): string | undefined
export function relativeOfWorkspace(
  workspace: string,
  targetDir?: string | null,
): string | undefined {
  const absoluteDir = absoluteOfWorkspace(workspace, targetDir)
  if (absoluteDir == null) return undefined
  const relativeDir: string = path.relative(workspace, absoluteDir)
  return path.normalize(relativeDir)
}


/**
 * Calc absolute path of p under the workspace
 *
 * @param workspace
 * @param targetDir
 */
export function absoluteOfWorkspace(
  workspace: string,
  targetDir?: null,
): undefined
export function absoluteOfWorkspace(
  workspace: string,
  targetDir: string,
): string
export function absoluteOfWorkspace(
  workspace: string,
  targetDir?: string | null,
): string | undefined
export function absoluteOfWorkspace(
  workspace: string,
  targetDir?: string | null,
): string | undefined {
  if (targetDir == null) return undefined
  const absoluteDir: string = path.resolve(workspace, targetDir)
  return absoluteDir
}
