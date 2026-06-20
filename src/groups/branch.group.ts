import { Command } from 'commander'

import { createBranchCommitCommand } from '~/commands/commit.command.js'
import { createBranchCreateCommand } from '~/commands/create.command.js'
import { createBranchReleaseCommand } from '~/commands/release.command.js'
import { createBranchRenameCommand } from '~/commands/rename.command.js'
import { createBranchSquashCommand } from '~/commands/squash.command.js'
import { createBranchUpdateCommand } from '~/commands/update.command.js'



export function createBranchCommandGroup (): Command {
  const command = new Command('branch')

  command
    .description('Manage Git branches')

  command
    .addCommand(createBranchCreateCommand())
    .addCommand(createBranchUpdateCommand())
    .addCommand(createBranchCommitCommand())
    .addCommand(createBranchSquashCommand())
    .addCommand(createBranchRenameCommand())
    .addCommand(createBranchReleaseCommand())

  return command
}
