import { cancel, outro } from '@clack/prompts'
import { Command } from 'commander'

import { loadConfig } from '~/config/config-loader.js'
import { getCurrentBranchName, isInsideGitRepository, rebaseCurrentBranchOnto, fetchBranch } from '~utils/git.js'



export function createBranchUpdateCommand (): Command {
  const command = new Command('update')

  command
    .description('Update the current branch from the main branch')
    .option('-b, --base <branch>', 'Base branch name to rebase onto')
    .option('-r, --remote <remote>', 'Remote that contains the main branch', 'origin')
    .action(async (options: { base?: string, remote: string }) => {
      const configResult = await loadConfig()

      if (configResult.error) {
        cancel(configResult.error.message)
        process.exitCode = 1

        return
      }

      const config = configResult.data
      const baseBranch = options.base ?? config.defaultBranch

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

      if (currentBranchResult.error) {
        cancel(currentBranchResult.error.message)
        process.exitCode = 1

        return
      }

      if (currentBranchResult.data === baseBranch) {
        cancel('Current branch is already the main branch')
        process.exitCode = 1

        return
      }

      const fetchResult = await fetchBranch(options.remote, baseBranch)

      if (fetchResult.error) {
        cancel(fetchResult.error.message)
        process.exitCode = 1

        return
      }

      const rebaseResult = await rebaseCurrentBranchOnto(`${options.remote}/${baseBranch}`)

      if (rebaseResult.error) {
        cancel(rebaseResult.error.message)
        process.exitCode = 1

        return
      }

      outro(
        `Updated branch ${currentBranchResult.data} on top of ${options.remote}/${baseBranch}. ` +
        'If the branch was already pushed, you may need to push with --force-with-lease.',
      )
    })

  return command
}
