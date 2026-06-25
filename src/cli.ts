import { Command } from 'commander'

import pkg from '../package.json' with { type: 'json' }

import { createInitCommand } from '~/commands/init.command.js'
import { createBranchCommandGroup } from '~/groups/branch.group.js'



async function main (): Promise<void> {
  const cli = new Command()

  cli
    .name('gith')
    .description('Git workflow helper cli')
    .version(pkg.version)
  cli.addCommand(createBranchCommandGroup())
  cli.addCommand(createInitCommand())

  await cli.parseAsync()
}

main()
