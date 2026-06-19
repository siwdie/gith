import { isCancel, select, text } from '@clack/prompts'

import type { GithConfig } from '~/config/config.types.js'
import type { ResultType } from '~/utils/result.js'

import { isValidBranchNamePart, normalizeBranchNamePart } from '~/utils/branch/naming.js'
import { cancelCommand } from '~/utils/cancel-command.js'
import { createDataResult, createErrorResult } from '~/utils/result.js'



type BranchType = GithConfig['branchTypes'][number]['value']


export async function promptForBranchName (config: GithConfig): Promise<string> {
  const branchTypeValue = await select({
    message: 'Select the branch type',
    options: config.branchTypes,
  })

  if (isCancel(branchTypeValue)) {
    cancelCommand('Operation cancelled', 0)
  }

  const branchTypeResult = parseBranchType(config, branchTypeValue)

  if (branchTypeResult.error) {
    cancelCommand(branchTypeResult.error.message)
  }

  const branchName = await askForBranchName(branchTypeResult.data)

  if (branchName.error !== null) {
    cancelCommand(branchName.error.message)
  }

  return branchName.data
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

    if (!branchNameResult.error)
      return branchNameResult
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
