import { execa } from 'execa'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { GithMonorepoType } from '~/config/config.types.js'
import type { Maybe } from '~/types/common.js'



export type WorkspacePackage = {
  name: string
  location: string
}

export const repoTypes: Record<GithMonorepoType, (cwd: string) => Promise<Maybe<Array<WorkspacePackage>>>> = {
  pnpm: getPnpmPackages,
  yarn: getYarnPackages,
  cargo: getCargoPackages,
  maven: getMavenPackages,
  gradle: getGradlePackages,
}

export async function getWorkspacePackages (type?: GithMonorepoType, cwd?: string): Promise<Array<WorkspacePackage>> {
  if (!type) return []

  const result = await repoTypes[type](cwd ?? process.cwd())

  return result ?? []
}

async function getPnpmPackages (cwd: string): Promise<Maybe<Array<WorkspacePackage>>> {
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

async function getYarnPackages (cwd: string): Promise<Maybe<Array<WorkspacePackage>>> {
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

async function getCargoPackages (cwd: string): Promise<Maybe<Array<WorkspacePackage>>> {
  try {
    const { stdout } = await execa('cargo', ['metadata', '--no-deps', '--format-version', '1'], { cwd })
    const metadata = JSON.parse(stdout) as { packages: Array<{ name: string, manifest_path: string }> }

    return metadata.packages
      .map(p => ({
        name: p.name,
        location: p.manifest_path.replace(cwd, '').replace(/^\//, '').replace('/Cargo.toml', ''),
      }))
      .filter(p => p.location !== '')
  } catch {
    return null
  }
}

async function getGradlePackages (cwd: string): Promise<Maybe<Array<WorkspacePackage>>> {
  try {
    const { stdout } = await execa('gradle', ['Packages', '--console=plain'], { cwd })

    return stdout
      .split('\n')
      .filter(line => line.includes('--- Project \''))
      .map(line => {
        const name = line.match(/--- Project '([^']+)'/)?.[1] ?? ''
        const location = name.replace(/^:/, '').replace(/:/g, '/')

        return { name, location }
      })
      .filter(p => Boolean(p.name))
  } catch {
    return null
  }
}

async function getMavenPackages (cwd: string): Promise<Maybe<Array<WorkspacePackage>>> {
  try {
    const content = await readFile(join(cwd, 'pom.xml'), 'utf8')
    const modules = [...content.matchAll(/<module>([^<]+)<\/module>/g)]
      .map(m => m[1] ?? '')
      .filter(Boolean)

    if (modules.length === 0) return null

    return modules.map(name => ({ name, location: name }))
  } catch {
    return null
  }
}
