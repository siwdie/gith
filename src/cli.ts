import { log } from '@clack/prompts'
import { Command } from 'commander'

import pkg from '../package.json' with { type: 'json' }

import { createInitCommand } from '~/commands/init.command.js'
import { loadConfig } from '~/config/config-loader.js'
import { createBranchCommandGroup } from '~/groups/branch.group.js'
import { cancelCommand } from '~/utils/cancel-command.js'



const configResult = await loadConfig()

if (configResult.error) {
  configResult.error.message.split('\n').forEach(line => log.error(line))
  cancelCommand('Invalid gith.config.json')
}

const cli = new Command()

cli
  .name('gith')
  .description('Git workflow helper cli')
  .version(pkg.version)

cli.addCommand(createBranchCommandGroup(configResult.data))
cli.addCommand(createInitCommand())

await cli.parseAsync()
