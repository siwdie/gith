import { Command } from 'commander'

import type { GithConfig } from '~/config/config.types.js'

import { createBranchCommitCommand } from '~/commands/commit.command.js'
import { createBranchCreateCommand } from '~/commands/create.command.js'
import { createBranchReleaseCommand } from '~/commands/release.command.js'
import { createBranchRenameCommand } from '~/commands/rename.command.js'
import { createBranchSquashCommand } from '~/commands/squash.command.js'
import { createBranchUpdateCommand } from '~/commands/update.command.js'



export function createBranchCommandGroup (config: GithConfig): Command {
  const command = new Command('branch')

  command
    .description('Manage Git branches')

  command
    .addCommand(createBranchCreateCommand(config))
    .addCommand(createBranchUpdateCommand(config))
    .addCommand(createBranchCommitCommand(config))
    .addCommand(createBranchSquashCommand(config))
    .addCommand(createBranchRenameCommand(config))
    .addCommand(createBranchReleaseCommand())

  return command
}
