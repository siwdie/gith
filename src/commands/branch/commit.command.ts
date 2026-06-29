import { intro, outro } from '@clack/prompts'
import { Command } from 'commander'


import { getConfigOrCancel } from '~/commands/_helper/get-config-or-cancel.js'
import { promptForCommitMessage } from '~/commands/branch/_helper/prompt-commit.js'
import { cancelCommand } from '~/utils/cancel-command.js'
import { commitWithMessage, hasStagedChanges, stageAllTrackedFiles } from '~utils/git.js'



type BranchCommitCommandOptions = {
  all?: boolean
}

export function createBranchCommitCommand (): Command {
  const command = new Command('commit')

  command
    .description('Create a conventional commit for the current branch')
    .option('--all', 'Stage all tracked changes before committing')
    .action(async (options: BranchCommitCommandOptions) => {
      const config = await getConfigOrCancel()

      intro('Create branch commit')

      if (options.all) {
        const stageResult = await stageAllTrackedFiles()

        if (stageResult.error !== null) {
          cancelCommand(stageResult.error.message)
        }
      }

      const stagedResult = await hasStagedChanges()

      if (stagedResult.error) {
        cancelCommand(stagedResult.error.message)
      }

      if (!stagedResult.data) {
        cancelCommand('No staged changes found. Stage files first or run the command with --all.')
      }

      const message = await promptForCommitMessage(config)


      const commitResult = await commitWithMessage(
        message.header,
        message.body,
      )

      if (commitResult.error !== null) {
        cancelCommand(commitResult.error.message)
      }

      outro('Commit created successfully.')
    })

  return command
}
