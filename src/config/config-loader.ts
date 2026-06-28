import { log } from '@clack/prompts'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { GithConfig, GithConfigPartial } from '~/config/config.types.js'
import type { ResultType } from '~utils/result.js'

import { githConfigPartialSchema, githConfigSchema } from '~/config/config.types.js'
import { DEFAULT_GITH_CONFIG } from '~/config/default.config.js'
import { parseToTypedJson } from '~/utils/object.js'
import { safeParse } from '~/utils/zod.js'
import { createDataResult, createErrorResult } from '~utils/result.js'



export async function loadConfig (
  cwd?: string,
): Promise<ResultType<GithConfig>> {
  const workingDirectory = cwd ?? process.cwd()
  const configPath = join(workingDirectory, 'gith.config.json')

  try {
    const fileContent = await readFile(configPath, 'utf8')
    const jsonResult = parseToTypedJson<unknown>(fileContent)

    if (jsonResult.error) {
      log.warn(`Error reading config: ${jsonResult.error.message}. — using defaults \n`)

      return createDataResult(DEFAULT_GITH_CONFIG)
    }

    const parsed = safeParse(githConfigPartialSchema, jsonResult.data)

    if (parsed.error) return createErrorResult(parsed.error)

    return mergeConfig(parsed.data)
  } catch {
    return createDataResult(DEFAULT_GITH_CONFIG)
  }
}

function mergeConfig (config: GithConfigPartial): ResultType<GithConfig> {
  const minLength = config.commit?.header?.minLength ?? DEFAULT_GITH_CONFIG.commit.header.minLength
  const maxLength = config.commit?.header?.maxLength ?? DEFAULT_GITH_CONFIG.commit.header.maxLength

  if (minLength > maxLength) {
    return createErrorResult(new Error(
      `commit.header.minLength (${minLength}) cannot be greater than commit.header.maxLength (${maxLength})`
    ))
  }

  const mergedConfig = {
    monorepo: config.monorepo,
    defaultBranch: config.defaultBranch ?? DEFAULT_GITH_CONFIG.defaultBranch,
    branchTypes: config.branchTypes ?? DEFAULT_GITH_CONFIG.branchTypes,
    commitTypes: config.commitTypes ?? DEFAULT_GITH_CONFIG.commitTypes,
    scope: config.scope,
    release: config.release,
    commit: {
      header: {
        minLength,
        maxLength,
      },
      body: config.commit?.body
    },
  } satisfies GithConfig


  return safeParse(githConfigSchema, mergedConfig)
}
