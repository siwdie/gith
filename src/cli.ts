import { Command } from 'commander'

import { createInitCommand } from '~/commands/init.command.js'
import { createBranchCommandGroup } from '~/groups/branch.group.js'



const cli = new Command()

cli
  .name('gith')
  .description('Git workflow helper cli')
  .version('0.1.0')

cli.addCommand(createBranchCommandGroup())
cli.addCommand(createInitCommand())

await cli.parseAsync()
