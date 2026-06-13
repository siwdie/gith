import { cancel, intro, outro } from '@clack/prompts'
import { Command } from 'commander'

import { promptForCommitMessage } from '~/commands/_helper/prompt-commit.js'
import { loadConfig } from '~/config/config-loader.js'
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
      const configResult = await loadConfig()

      if (configResult.error) {
        cancel(configResult.error.message)
        process.exit(1)
      }

      const config = configResult.data

      intro('Create branch commit')

      if (!options.all) {
        const stagedResult = await hasStagedChanges()

        if (stagedResult.error) {
          cancel(stagedResult.error.message)
          process.exit(1)
        }

        if (!stagedResult.data) {
          cancel('No staged changes found. Stage files first or run the command with --all.')
          process.exit(1)
        }
      }

      const message = await promptForCommitMessage(config)

      if (options.all) {
        const stageResult = await stageAllTrackedFiles()

        if (stageResult.error !== null) {
          cancel(stageResult.error.message)
          process.exit(1)
        }
      }

      const commitResult = await commitWithMessage(
        message.header,
        message.body,
      )

      if (commitResult.error !== null) {
        cancel(commitResult.error.message)
        process.exit(1)
      }

      outro('Commit created successfully.')
    })

  return command
}
