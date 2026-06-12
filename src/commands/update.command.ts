import { outro } from '@clack/prompts'
import { Command } from 'commander'

import { getCurrentBranchName, isInsideGitRepository, rebaseCurrentBranchOnto, fetchBranch } from '~utils/git.js'



export function createBranchUpdateCommand (): Command {
  const command = new Command('update')

  command
    .description('Update the current branch from the main branch')
    .option('-b, --base <branch>', 'Main branch name to rebase onto', 'main')
    .option('-r, --remote <remote>', 'Remote that contains the main branch', 'origin')
    .action(async (options: { base: string, remote: string }) => {
      const repositoryResult = await isInsideGitRepository()

      if (repositoryResult.error !== null) {
        console.error(repositoryResult.error.message)
        process.exitCode = 1

        return
      }

      if (!repositoryResult.data) {
        console.error('Current directory is not a valid Git repository')
        process.exitCode = 1

        return
      }

      const currentBranchResult = await getCurrentBranchName()

      if (currentBranchResult.error !== null) {
        console.error(currentBranchResult.error.message)
        process.exitCode = 1

        return
      }

      if (currentBranchResult.data === options.base) {
        console.error('Current branch is already the main branch')
        process.exitCode = 1

        return
      }

      const fetchResult = await fetchBranch(options.remote, options.base)

      if (fetchResult.error !== null) {
        console.error(fetchResult.error.message)
        process.exitCode = 1

        return
      }

      const rebaseResult = await rebaseCurrentBranchOnto(`${options.remote}/${options.base}`)

      if (rebaseResult.error !== null) {
        console.error(rebaseResult.error.message)
        process.exitCode = 1

        return
      }

      outro(
        `Updated branch ${currentBranchResult.data} on top of ${options.remote}/${options.base}. ` +
        'If the branch was already pushed, you may need to push with --force-with-lease.',
      )
    })

  return command
}
