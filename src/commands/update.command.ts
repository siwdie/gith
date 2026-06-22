import { outro, spinner } from '@clack/prompts'
import { Command } from 'commander'

import type { GithConfig } from '~/config/config.types.js'

import { fetchBranch, getCurrentBranchName, rebaseCurrentBranchOnto } from '~utils/git.js'



export function createBranchUpdateCommand (config: GithConfig): Command {
  const command = new Command('update')

  command
    .description('Update the current branch from the main branch')
    .option('-b, --base <branch>', 'Base branch name to rebase onto')
    .option('-r, --remote <remote>', 'Remote that contains the main branch', 'origin')
    .action(async (options: { base?: string, remote: string }) => {
      const spinnerService = spinner()

      try {
        spinnerService.start('Updating branch...')

        // TODO: check if branch exists
        const baseBranch = options.base ?? config.defaultBranch

        const currentBranchResult = await getCurrentBranchName()

        if (currentBranchResult.error) {
          throw new Error(currentBranchResult.error.message)
        }

        const fetchResult = await fetchBranch(options.remote, baseBranch)

        if (fetchResult.error) {
          throw new Error(fetchResult.error.message)
        }

        const rebaseResult = await rebaseCurrentBranchOnto(`${options.remote}/${baseBranch}`)

        if (rebaseResult.error) {
          throw new Error(rebaseResult.error.message)
        }

        spinnerService.stop()

        outro(`Updated branch ${currentBranchResult.data} on top of ${options.remote}/${baseBranch}. \n\n` +
        'If the branch was already pushed, you may need to push with --force-with-lease.')

      } catch (error) {
        spinnerService.stop()

        const message = error instanceof Error ? error.message : 'Unknown error'
        outro(message)

        process.exitCode = 1
      }
    })

  return command
}
