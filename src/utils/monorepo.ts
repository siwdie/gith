import { execa } from 'execa'



export type WorkspacePackage = {
  name: string
  location: string
}

export const repoTypes = {
  'pnpm': getPnpmPackages,
  'yarn': getYarnPackages,
}

export type RepoTypes = keyof typeof repoTypes

export async function getWorkspacePackages (type?: RepoTypes, cwd?: string): Promise<Array<WorkspacePackage>> {
  if (!type) return []

  const result = await repoTypes[type](cwd ?? process.cwd())

  return result ?? []
}

async function getPnpmPackages (cwd: string): Promise<Array<WorkspacePackage> | null> {
  try {
    const { stdout } = await execa('pnpm', ['list', '-r', '--depth', '-1', '--json'], { cwd })
    const packages = JSON.parse(stdout) as Array<{ name: string, path: string }>

    return packages
      .map(p => ({
        name: p.name,
        location: p.path.replace(cwd, '').replace(/^\//, ''),
      }))
      .filter(p => p.location !== '')
  } catch {
    return null
  }
}

async function getYarnPackages (cwd: string): Promise<Array<WorkspacePackage> | null> {
  try {
    const { stdout } = await execa('yarn', ['workspaces', 'list', '--json'], { cwd })
    const packages = stdout
      .trim()
      .split('\n')
      .map(line => JSON.parse(line) as { name: string, location: string })

    return packages
      .map(p => ({
        name: p.name,
        location: p.location,
      }))
      .filter(p => p.location !== '.')
  } catch {
    return null
  }
}
