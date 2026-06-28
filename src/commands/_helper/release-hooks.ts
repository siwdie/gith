import { execaCommand } from 'execa'

import type { GithConfig } from '~/config/config.types.js'
import type { ResultType } from '~/utils/result.js'

import { createDataResult, createErrorResult } from '~/utils/result.js'



type HookParams = {
  config: GithConfig
  version: string
  tag: string
  scope: string
}

export async function runReleaseBeforeCommitHook (params: HookParams): Promise<ResultType<boolean>> {
  const hook = params.config.release?.hooks?.beforeCommit?.trim()

  if (!hook) return createDataResult(false)

  const command = interpolateTemplate(hook, {
    version: params.version,
    tag: params.tag,
    scope: params.scope,
  })

  try {
    await execaCommand(command, {
      shell: true,
      stdio: 'inherit',
      preferLocal: true,
    })

    return createDataResult(true)
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Release hook failed.'))
  }
}


function escapeRegExp (value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function interpolateTemplate (
  template: string,
  values: Record<string, string>,
): string {
  let result = template

  for (const [key, value] of Object.entries(values)) {
    result = result.replace(
      new RegExp(`\\{\\{\\s*${escapeRegExp(key)}\\s*\\}\\}`, 'g'),
      value,
    )
  }

  return result
}
