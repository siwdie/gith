import {
  cancel,
  confirm,
  intro,
  outro,
  text,
} from '@clack/prompts'
import { Command } from 'commander'

import { isPromptValue } from '~/guards/prompt.js'
import {
  commitWithMessage,
  countCommitsSince,
  getCurrentBranchName,
  hasPendingChanges,
  softResetTo,
} from '~utils/git.js'



export function createBranchSquashCommand (): Command {
  const command = new Command('squash')

  command
    .description('Squash branch commits into a single commit')
    .option('--base <branch>', 'Base branch to compare against', 'main')
    .action(async (options: { base?: string }) => {
      const baseBranch = options.base ?? 'main'

      const cleanResult = await hasPendingChanges()

      if (cleanResult.error ?? !cleanResult.data) {
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

      const countResult = await countCommitsSince(baseBranch)

      if (countResult.error) {
        cancel(countResult.error.message)
        process.exit(1)
      }

      const commitCount = countResult.data

      if (commitCount < 2) {
        cancel(`Nothing to squash. The branch only has ${commitCount} commit relative to ${baseBranch}.`)
        process.exit(1)
      }

      const description = await text({
        message: `Squash ${commitCount} commits from ${currentBranchName} into one commit`,
        placeholder: 'add branch commit and squash commands',
        validate: (value) => {
          const normalizedValue = value?.trim()

          if (!normalizedValue) {
            return 'Description is required.'
          }

          if (normalizedValue.length > 72) {
            return 'Keep the description under 72 characters.'
          }

          return undefined
        },
      })

      if (!isPromptValue(description)) {
        cancelCommand()
      }

      const body = await text({
        message: 'Body (optional)',
        placeholder: 'Explain the grouped changes',
      })

      if (!isPromptValue(body)) {
        cancelCommand()
      }

      const shouldContinue = await confirm({
        message: `Squash ${commitCount} commits from ${baseBranch}..HEAD into a new commit?`,
        initialValue: true,
      })

      if (!isPromptValue(shouldContinue)) {
        cancelCommand()
      }

      if (!shouldContinue) {
        cancelCommand()
      }

      const resetResult = await softResetTo(`HEAD~${commitCount}`)

      if (resetResult.error) {
        cancel(resetResult.error.message)
        process.exit(1)
      }

      const commitResult = await commitWithMessage(
        description.trim(),
        body.trim() || undefined,
      )

      if (commitResult.error) {
        cancel(commitResult.error.message)
        process.exit(1)
      }

      outro(`Squashed ${commitCount} commits into one commit on ${currentBranchName}.`)
    })

  return command
}

function cancelCommand (): never {
  cancel('Squash cancelled.')
  process.exit(0)
}
