import { execaCommand } from 'execa'

import type { ResultType } from '~/utils/result.js'

import { createDataResult, createErrorResult } from '~/utils/result.js'



export async function runHook (hook: string | undefined, hookType: string, params: { version: string, tag: string, scope: string }): Promise<ResultType<boolean>> {
  if (!hook) return createDataResult(false)

  const command = interpolateTemplate(hook, params)

  try {
    await execaCommand(command, {
      shell: true,
      stdio: 'inherit',
      preferLocal: true,
    })

    return createDataResult(true)
  } catch (error) {
    const err = new Error(`[${hookType}] ${error instanceof Error ? error.message : 'Release hook failed.'}`)

    return createErrorResult(err)
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
