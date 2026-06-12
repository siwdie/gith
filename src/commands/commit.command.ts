import {
  cancel,
  confirm,
  intro,
  multiline,
  outro,
  select,
  text
} from '@clack/prompts'
import { Command } from 'commander'

import { COMMIT_TYPES } from '~/constants/commit.js'
import { isPromptValue } from '~/guards/prompt.js'
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

      const type = await select({
        message: 'Select the commit type',
        options: COMMIT_TYPES,
      })

      if (!isPromptValue(type)) {
        cancelCommand()
      }

      const scope = await text({
        message: 'Scope (optional)',
        placeholder: 'branch',
      })

      if (!isPromptValue(scope)) {
        cancelCommand()
      }

      const description = await text({
        message: 'Short description',
        placeholder: 'add commit helper',
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

      const body = await multiline({
        message: 'Body (optional)',
        placeholder: 'Explain what changed and why',
      })

      if (!isPromptValue(body)) {
        cancelCommand()
      }

      const header = buildCommitHeader(type, scope, description)
      const normalizedBody = body.trim()

      const shouldCommit = await confirm({
        message: normalizedBody
          ? `Use this commit message?\n\n${header}\n\n${normalizedBody}`
          : `Use this commit message?\n\n${header}`,
        initialValue: true,
      })
      if (!isPromptValue(shouldCommit)) {
        cancelCommand()
      }

      if (!shouldCommit) {
        cancel('Commit cancelled.')
        process.exit(0)
      }

      if (options.all) {
        const stageResult = await stageAllTrackedFiles()

        if (stageResult.error !== null) {
          cancel(stageResult.error.message)
          process.exit(1)
        }
      }

      const commitResult = await commitWithMessage(
        header,
        normalizedBody ?? undefined,
      )

      if (commitResult.error !== null) {
        cancel(commitResult.error.message)
        process.exit(1)
      }

      outro('Commit created successfully.')
    })

  return command
}


function cancelCommand (): never {
  cancel('Commit cancelled.')
  process.exit(0)
}

function buildCommitHeader (
  type: string,
  scope: string,
  description: string,
): string {
  const normalizedScope = scope.trim()
  const normalizedDescription = description.trim()

  if (normalizedScope) {
    return `${type}(${normalizedScope}): ${normalizedDescription}`
  }

  return `${type}: ${normalizedDescription}`
}
