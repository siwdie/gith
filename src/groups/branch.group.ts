import { Command } from 'commander'


import { createBranchCommitCommand } from '~/commands/branch/commit.command.js'
import { createBranchCreateCommand } from '~/commands/branch/create.command.js'
import { createBranchReleaseCommand } from '~/commands/branch/release.command.js'
import { createBranchRenameCommand } from '~/commands/branch/rename.command.js'
import { createBranchSquashCommand } from '~/commands/branch/squash.command.js'
import { createBranchUpdateCommand } from '~/commands/branch/update.command.js'



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
