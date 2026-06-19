import { intro, outro } from '@clack/prompts'
import { Command } from 'commander'

import type { GithConfig } from '~/config/config.types.js'

import { checkIfGitRepository } from '~/commands/_helper/check-if-git-repository.js'
import { promptForBranchName } from '~/commands/_helper/prompt-branch-name.js'
import { loadConfig } from '~/config/config-loader.js'
import { cancelCommand } from '~/utils/cancel-command.js'
import { createBranch, getCurrentBranchName } from '~utils/git.js'



export type BranchType = GithConfig['branchTypes'][number]['value']

export function createBranchCreateCommand (): Command {
  const command = new Command('create')

  command
    .description('Create a branch interactively')
    .action(async () => {
      const configResult = await loadConfig()

      if (configResult.error) {
        cancelCommand(configResult.error.message)
      }

      const config = configResult.data

      intro('Create branch')

      await checkIfGitRepository()

      const currentBranchResult = await getCurrentBranchName()

      if (currentBranchResult.error !== null) {
        cancelCommand(currentBranchResult.error.message)
      }

      const branchName = await promptForBranchName(config)

      const createBranchResult = await createBranch(branchName)

      if (createBranchResult.error !== null) {
        cancelCommand(createBranchResult.error.message)
      }

      outro(`Created branch ${branchName} from ${currentBranchResult.data}`)
    })

  return command
}
