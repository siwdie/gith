import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { GithConfig } from '~/config/config.types.js'
import type { ResultType } from '~utils/result.js'

import { DEFAULT_GITH_CONFIG } from '~/config/default.config.js'
import { isPartialGithConfig } from '~/guards/config.js'
import { createDataResult, createErrorResult } from '~utils/result.js'



export async function loadConfig (
  cwd?: string,
): Promise<ResultType<GithConfig>> {
  const workingDirectory = cwd ?? process.cwd()
  const configPath = join(workingDirectory, 'gith.config.json')

  try {
    const fileContent = await readFile(configPath, 'utf8')
    const parsedConfig: unknown = JSON.parse(fileContent)

    if (!isPartialGithConfig(parsedConfig)) return createErrorResult(new Error('Invalid gith.config.json format'))

    return createDataResult(mergeConfig(parsedConfig))
  } catch (error) {
    if (
      error instanceof Error
      && 'code' in error
      && error.code === 'ENOENT'
    ) {
      return createDataResult(DEFAULT_GITH_CONFIG)
    }

    if (error instanceof Error) return createErrorResult(error)

    return createErrorResult(new Error('Failed to load gith.config.json'))
  }
}

function mergeConfig (
  config: Partial<GithConfig>,
): GithConfig {
  return {
    defaultBranch: config.defaultBranch ?? DEFAULT_GITH_CONFIG.defaultBranch,
    branchTypes: config.branchTypes ?? DEFAULT_GITH_CONFIG.branchTypes,
    commitTypes: config.commitTypes ?? DEFAULT_GITH_CONFIG.commitTypes,
  }
}
