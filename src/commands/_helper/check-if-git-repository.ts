import { cancelCommand } from '~/utils/cancel-command.js'
import { isInsideGitRepository } from '~/utils/git.js'



export async function checkIfGitRepository (): Promise<void> {
  const repositoryResult = await isInsideGitRepository()

  if (repositoryResult.error) {
    cancelCommand(repositoryResult.error.message)
  }

  if (!repositoryResult.data) {
    cancelCommand('Current directory is not a valid Git repository')
  }
}
