import {
  cancel,
  confirm,
  intro,
  note,
  outro,
  select,
} from '@clack/prompts'
import { Command } from 'commander'

import { promptForCommitMessage } from '~/commands/_helper/prompt-commit.js'
import { loadConfig } from '~/config/config-loader.js'
import { isPromptValue } from '~/guards/prompt.js'
import {
  commitWithMessage,
  getCommitsSince,
  getCurrentBranchName,
  hasPendingChanges,
  softResetTo,
} from '~utils/git.js'



export function createBranchSquashCommand (): Command {
  const command = new Command('squash')

  command
    .description('Preview and squash branch commits into a single commit')
    .option('--base <branch>', 'Base branch to compare against')
    .action(async (options: { base?: string }) => {
      const configResult = await loadConfig()

      if (configResult.error) {
        cancel(configResult.error.message)
        process.exit(1)
      }

      const config = configResult.data
      const baseBranch = options.base ?? config.defaultBranch

      const cleanResult = await hasPendingChanges()

      if (cleanResult.error ?? cleanResult.data) {
        cancel(cleanResult.error?.message ?? 'Pending changes detected. Commit, stash, or discard them before continuing.')
        process.exit(1)
      }

      intro('Squash branch commits')

      const branchResult = await getCurrentBranchName()

      if (branchResult.error) {
        cancel(branchResult.error.message)
        process.exit(1)
      }

      const currentBranchName = branchResult.data

      const commitsResult = await getCommitsSince(baseBranch)

      if (commitsResult.error) {
        cancel(commitsResult.error.message)
        process.exit(1)
      }

      const commits = commitsResult.data

      if (commits.length < 2) {
        cancel(`Nothing to squash. The branch only has ${commits.length} commit relative to ${baseBranch}.`)
        process.exit(1)
      }

      let commitsToSquash = commits

      while (true) {
        const commitCount = commitsToSquash.length

        if (commitCount < 2) {
          cancel(`Nothing to squash. The selected range only contains ${commitCount} commit.`)
          process.exit(1)
        }

        note(
          commitsToSquash
            .map((commit, index) => `${index + 1}. ${commit.shortHash} ${commit.subject}`)
            .join('\n'),
          `Commits to squash (${commitCount})`,
        )

        const shouldUseThisRange = await confirm({
          message: `Squash these ${commitCount} commits into a single commit?`,
          initialValue: true,
        })

        if (!isPromptValue(shouldUseThisRange)) {
          cancelCommand()
        }

        if (shouldUseThisRange) {
          break
        }

        const firstCommitHash = await select({
          message: 'Select the first commit to include in the squash',
          options: commits.map((commit) => ({
            value: commit.hash,
            label: `${commit.shortHash} ${commit.subject}`,
            hint: commit.hash,
          })),
          initialValue: commitsToSquash[0]?.hash ?? commits[0]?.hash,
        })

        if (!isPromptValue(firstCommitHash)) {
          cancelCommand()
        }

        const firstCommitIndex = commits.findIndex(
          commit => commit.hash === firstCommitHash,
        )

        if (firstCommitIndex === -1) {
          cancel('Selected commit was not found.')
          process.exit(1)
        }

        commitsToSquash = commits.slice(firstCommitIndex)
      }

      const firstCommit = commitsToSquash[0]

      if (firstCommit === undefined) {
        cancel('No commits were selected for squash.')
        process.exit(1)
      }

      const message = await promptForCommitMessage(
        config,
        'Use this squashed commit message?',
      )

      const resetResult = await softResetTo(`${firstCommit.hash}^`)

      if (resetResult.error) {
        cancel(resetResult.error.message)
        process.exit(1)
      }

      const commitResult = await commitWithMessage(
        message.header,
        message.body,
      )

      if (commitResult.error) {
        cancel(commitResult.error.message)
        process.exit(1)
      }

      outro(`Squashed ${commitsToSquash.length} commits into one commit on ${currentBranchName}.`)
    })

  return command
}

function cancelCommand (): never {
  cancel('Squash cancelled.')
  process.exit(0)
}
