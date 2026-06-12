import { Command } from 'commander'

import { createBranchCommandGroup } from '~/groups/branch.group.js'



const program = new Command()

program
  .name('gith')
  .description('Git workflow helper cli')
  .version('0.1.0')

program.addCommand(createBranchCommandGroup())

await program.parseAsync()
