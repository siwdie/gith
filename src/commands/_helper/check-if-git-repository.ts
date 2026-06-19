import { cancel } from '@clack/prompts'

import { isInsideGitRepository } from '~/utils/git.js'



export async function checkIfGitRepository (): Promise<void> {
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
}
