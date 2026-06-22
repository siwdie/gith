import { intro, outro } from '@clack/prompts'
import { Command } from 'commander'

import type { GithConfig } from '~/config/config.types.js'

import { promptForBranchName } from '~/commands/_helper/prompt-branch-name.js'
import { cancelCommand } from '~/utils/cancel-command.js'
import { renameCurrentBranch } from '~utils/git.js'



export function createBranchRenameCommand (config: GithConfig): Command {
  const command = new Command('rename')

  command
    .description('Rename the current branch')
    .argument('[name]', 'New branch name')
    .action(async () => {
      intro('Rename branch')

      const branchName = await promptForBranchName(config)

      const renameResult = await renameCurrentBranch(branchName)

      if (renameResult.error) cancelCommand('Error renaming current branch')

      outro('Branch renamed successfully.')
    })

  return command
}
