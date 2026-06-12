import {
  cancel,
  intro,
  isCancel,
  outro,
  select,
  text
} from '@clack/prompts'
import { Command } from 'commander'

import type { GithConfig } from '~/config/config.types.js'
import type { ResultType } from '~/utils/result.js'

import { loadConfig } from '~/config/config-loader.js'
import { createDataResult, createErrorResult } from '~/utils/result.js'
import { isValidBranchNamePart, normalizeBranchNamePart } from '~utils/branch/naming.js'
import { createBranch, getCurrentBranchName, isInsideGitRepository } from '~utils/git.js'



export type BranchType = GithConfig['branchTypes'][number]['value']

export function createBranchCreateCommand (): Command {
  const command = new Command('create')

  command
    .description('Create a branch interactively')
    .action(async () => {
      const configResult = await loadConfig()

      if (configResult.error) {
        cancel(configResult.error.message)
        process.exit(1)
      }

      const config = configResult.data

      intro('Create branch')

      const repositoryResult = await isInsideGitRepository()

      if (repositoryResult.error) {
        cancel(repositoryResult.error.message)
        process.exitCode = 1

        return
      }

      if (!repositoryResult.data) {
        cancel('Current directory is not a valid Git repository')
        process.exitCode = 1

        return
      }

      const currentBranchResult = await getCurrentBranchName()

      if (currentBranchResult.error !== null) {
        cancel(currentBranchResult.error.message)
        process.exitCode = 1

        return
      }

      const branchTypeValue = await select({
        message: 'Select the branch type',
        options: config.branchTypes,
      })

      if (isCancel(branchTypeValue)) {
        cancel('Operation cancelled')
        process.exitCode = 1

        return
      }

      const branchTypeResult = parseBranchType(config, branchTypeValue)

      if (branchTypeResult.error) {
        cancel(branchTypeResult.error.message)
        process.exitCode = 1

        return
      }

      const branchName = await askForBranchName(branchTypeResult.data)

      if (branchName.error !== null) {
        cancel(branchName.error.message)
        process.exitCode = 1

        return
      }

      const createBranchResult = await createBranch(branchName.data)

      if (createBranchResult.error !== null) {
        cancel(createBranchResult.error.message)
        process.exitCode = 1

        return
      }

      outro(`Created branch ${branchName.data} from ${currentBranchResult.data}`)
    })

  return command
}

async function askForBranchName (
  branchType: BranchType,
): Promise<ResultType<string>> {
  while (true) {
    const branchNameValue = await text({
      message: `Enter the ${branchType} branch name (e.g.: add-search-panel)`,
      placeholder: 'add-search-panel',
      validate: (value) => {
        const branchNameResult = createBranchName(branchType, value ?? '')

        if (branchNameResult.error !== null) {
          return branchNameResult.error.message
        }

        return undefined
      },
    })

    if (isCancel(branchNameValue)) {
      return createErrorResult(new Error('Operation cancelled'))
    }

    const branchNameResult = createBranchName(branchType, branchNameValue)

    if (branchNameResult.error === null) {
      return branchNameResult
    }
  }
}

function createBranchName (
  branchType: BranchType,
  branchName: string,
): ResultType<string> {
  const normalizedBranchName = normalizeBranchNamePart(branchName)

  if (normalizedBranchName === '') {
    return createErrorResult(new Error('Branch name cannot be empty'))
  }

  if (!isValidBranchNamePart(normalizedBranchName)) {
    return createErrorResult(
      new Error('Branch name must use lowercase letters, numbers and hyphens'),
    )
  }

  return createDataResult(`${branchType}/${normalizedBranchName}`)
}

function parseBranchType (
  config: GithConfig,
  type: string,
): ResultType<BranchType> {
  const branchType = config.branchTypes.find((item) => item.value === type)

  if (!branchType) {
    return createErrorResult(new Error('Invalid branch type'))
  }

  return createDataResult(branchType.value)
}
