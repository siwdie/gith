import { Command } from 'commander'

import { createBranchCreateCommand } from '~/commands/create.command.js'
import { createBranchUpdateCommand } from '~/commands/update.command.js'



export function createBranchCommandGroup (): Command {
  const command = new Command('branch')

  command
    .description('Manage Git branches')

  command
    .addCommand(createBranchCreateCommand())
    .addCommand(createBranchUpdateCommand())

  return command
}
