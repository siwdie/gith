import {
  confirm,
  intro,
  isCancel,
  note,
  outro,
  select
} from '@clack/prompts'
import { Command } from 'commander'

import { checkIfGitRepository } from '~/commands/_helper/check-if-git-repository.js'
import { promptForCommitMessage } from '~/commands/_helper/prompt-commit.js'
import { loadConfig } from '~/config/config-loader.js'
import { cancelCommand } from '~/utils/cancel-command.js'
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
      await checkIfGitRepository()

      const configResult = await loadConfig()

      if (configResult.error) {
        cancelCommand(configResult.error.message)
      }

      const config = configResult.data
      const baseBranch = options.base ?? config.defaultBranch

      const cleanResult = await hasPendingChanges()

      if (cleanResult.error ?? cleanResult.data) {
        cancelCommand(cleanResult.error?.message ?? 'Pending changes detected. Commit, stash, or discard them before continuing.')
      }

      intro('Squash branch commits')

      const branchResult = await getCurrentBranchName()

      if (branchResult.error) {
        cancelCommand(branchResult.error.message)
      }

      const currentBranchName = branchResult.data

      const commitsResult = await getCommitsSince(baseBranch)

      if (commitsResult.error) {
        cancelCommand(commitsResult.error.message)
      }

      const commits = commitsResult.data

      if (commits.length < 2) {
        cancelCommand(`Nothing to squash. The branch only has ${commits.length} commit relative to ${baseBranch}.`)
      }

      let commitsToSquash = commits

      while (true) {
        const commitCount = commitsToSquash.length

        if (commitCount < 2) {
          cancelCommand(`Nothing to squash. The selected range only contains ${commitCount} commit.`)
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

        if (isCancel(shouldUseThisRange)) {
          cancelCommand('Squash cancelled.', 0)
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

        if (isCancel(firstCommitHash)) {
          cancelCommand('Squash cancelled.', 0)
        }

        const firstCommitIndex = commits.findIndex(
          commit => commit.hash === firstCommitHash,
        )

        if (firstCommitIndex === -1) {
          cancelCommand('Selected commit was not found.')
        }

        commitsToSquash = commits.slice(firstCommitIndex)
      }

      const firstCommit = commitsToSquash[0]

      if (firstCommit === undefined) {
        cancelCommand('No commits were selected for squash.')
      }

      const message = await promptForCommitMessage(
        config,
        'Use this squashed commit message?',
      )

      const resetResult = await softResetTo(`${firstCommit.hash}^`)

      if (resetResult.error) {
        cancelCommand(resetResult.error.message)
      }

      const commitResult = await commitWithMessage(
        message.header,
        message.body,
      )

      if (commitResult.error) {
        cancelCommand(commitResult.error.message)
      }

      outro(`Squashed ${commitsToSquash.length} commits into one commit on ${currentBranchName}.`)
    })

  return command
}
