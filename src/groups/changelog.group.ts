import { Command } from 'commander'

import { createChangelogRebuildCommand } from '~/commands/changelog/rebuild.command.js'
import { createChangelogUpdateCommand } from '~/commands/changelog/update.command.js'



export function createChangelogCommandGroup (): Command {
  const command = new Command('changelog')

  command
    .description('Manage changelog file')

  command
    .addCommand(createChangelogUpdateCommand())
    .addCommand(createChangelogRebuildCommand())

  return command
}
