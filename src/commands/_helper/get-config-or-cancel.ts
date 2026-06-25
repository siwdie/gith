import { log } from '@clack/prompts'

import type { GithConfig } from '~/config/config.types.js'

import { loadConfig } from '~/config/config-loader.js'
import { cancelCommand } from '~/utils/cancel-command.js'
import { checkIfGitRepository } from '~/utils/check-if-git-repository.js'



export async function getConfigOrCancel (): Promise<GithConfig> {
  await checkIfGitRepository()

  const configResult = await loadConfig()

  if (configResult.error) {
    configResult.error.message.split('\n').forEach(line => log.error(line))
    cancelCommand('Invalid gith.config.json')
  }

  return configResult.data
}
