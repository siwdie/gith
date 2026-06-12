import { Command } from 'commander'

import { createBranchCreateCommand } from '~/commands/create.command.js'



export function createBranchCommandGroup (): Command {
  const command = new Command('branch')

  command
    .description('Manage Git branches')

  command
    .addCommand(createBranchCreateCommand())

  return command
}
