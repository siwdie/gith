import { intro, outro } from '@clack/prompts'
import { Command } from 'commander'

import { checkIfGitRepository } from '~/commands/_helper/check-if-git-repository.js'
import { promptForBranchName } from '~/commands/_helper/prompt-branch-name.js'
import { loadConfig } from '~/config/config-loader.js'
import { cancelCommand } from '~/utils/cancel-command.js'
import { renameCurrentBranch } from '~utils/git.js'



export function createBranchRenameCommand (): Command {
  const command = new Command('rename')

  command
    .description('Rename the current branch')
    .argument('[name]', 'New branch name')
    .action(async () => {
      await checkIfGitRepository()

      const configResult = await loadConfig()

      if (configResult.error) cancelCommand(configResult.error.message)

      const config = configResult.data

      intro('Rename branch')

      const branchName = await promptForBranchName(config)

      const renameResult = await renameCurrentBranch(branchName)

      if (renameResult.error) cancelCommand('Error renaming current branch')

      outro('Branch renamed successfully.')
    })

  return command
}
