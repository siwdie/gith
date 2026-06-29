import { intro, outro } from '@clack/prompts'
import { Command } from 'commander'

import type { GithConfig } from '~/config/config.types.js'

import { getConfigOrCancel } from '~/commands/_helper/get-config-or-cancel.js'
import { promptForBranchName } from '~/commands/branch/_helper/prompt-branch-name.js'
import { cancelCommand } from '~/utils/cancel-command.js'
import { createBranch, getCurrentBranchName } from '~utils/git.js'



export type BranchType = GithConfig['branchTypes'][number]['value']

export function createBranchCreateCommand (): Command {
  const command = new Command('create')

  command
    .description('Create a branch interactively')
    .action(async () => {
      const config = await getConfigOrCancel()

      intro('Create branch')

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
