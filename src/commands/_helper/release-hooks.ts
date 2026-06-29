import type { GithConfig } from '~/config/config.types.js'

import { cancelCommand } from '~/utils/cancel-command.js'
import { runHook } from '~/utils/hooks.js'



type HookParams = {
  version: string
  tag: string
  scope: string
}

export async function runReleaseBeforeCommitHook (
  config: GithConfig,
  params: HookParams,
): Promise<void> {
  const hook = config.release?.hooks?.beforeCommit?.trim()

  const hookResult = await runHook(hook, 'BeforeCommit', params)

  if (hookResult.error) {
    cancelCommand(hookResult.error.message)
  }
}

export async function runReleaseAfterCommitHook (
  config: GithConfig,
  params: HookParams,
): Promise<void> {
  const hook = config.release?.hooks?.afterCommit?.trim()

  const hookResult = await runHook(hook, 'AfterCommit', params)

  if (hookResult.error) {
    cancelCommand(hookResult.error.message)
  }
}

export function hasReleaseHook (config: GithConfig, type: keyof NonNullable<NonNullable<GithConfig['release']>['hooks']>): boolean {
  return Object.entries(config.release?.hooks ?? {}).some(([key, value]) => key === type && Boolean(value.trim()))
}
