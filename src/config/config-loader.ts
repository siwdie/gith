import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { GithConfig } from '~/config/config.types.js'
import type { ResultType } from '~utils/result.js'

import { githConfigPartialSchema, githConfigSchema } from '~/config/config.types.js'
import { DEFAULT_GITH_CONFIG } from '~/config/default.config.js'
import { createDataResult, createErrorResult } from '~utils/result.js'



export async function loadConfig (
  cwd?: string,
): Promise<ResultType<GithConfig>> {
  const workingDirectory = cwd ?? process.cwd()
  const configPath = join(workingDirectory, 'gith.config.json')

  try {
    const fileContent = await readFile(configPath, 'utf8')
    const parsed = githConfigPartialSchema.safeParse(JSON.parse(fileContent))

    if (!parsed.success) {
      return createErrorResult(new Error(
        parsed.error.issues
          .map(i => `${i.path.join('.')}: ${i.message}`)
          .join('\n'),
      ))
    }

    return mergeConfig(parsed.data)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return createDataResult(DEFAULT_GITH_CONFIG)
    }

    if (error instanceof Error) return createErrorResult(error)

    return createErrorResult(new Error('Failed to load gith.config.json'))
  }
}

function mergeConfig (config: Partial<GithConfig>): ResultType<GithConfig> {
  const merged = {
    defaultBranch: config.defaultBranch ?? DEFAULT_GITH_CONFIG.defaultBranch,
    branchTypes: config.branchTypes ?? DEFAULT_GITH_CONFIG.branchTypes,
    commitTypes: config.commitTypes ?? DEFAULT_GITH_CONFIG.commitTypes,
  }

  const parsed = githConfigSchema.safeParse(merged)

  if (!parsed.success) {
    return createErrorResult(new Error(
      parsed.error.issues
        .map(i => `${i.path.join('.')}: ${i.message}`)
        .join('\n'),
    ))
  }

  return createDataResult(parsed.data)
}
