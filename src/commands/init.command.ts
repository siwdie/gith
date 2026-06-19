import { confirm, intro, outro } from '@clack/prompts'
import { Command } from 'commander'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { DEFAULT_GITH_CONFIG } from '~/config/default.config.js'
import { isPromptValue } from '~/guards/prompt.js'
import { cancelCommand } from '~/utils/cancel-command.js'
import { fileExists } from '~/utils/file.js'



type InitCommandOptions = {
  force?: boolean
}


export function createInitCommand (): Command {
  const command = new Command('init')

  command
    .description('Generate a gith.config.json with default values')
    .option('--force', 'Overwrite existing gith.config.json without prompt')
    .action(async (options: InitCommandOptions) => {
      const cwd = process.cwd()
      const configPath = join(cwd, 'gith.config.json')

      const configExists = await fileExists(configPath)

      if (configExists && !options.force) {
        const shouldOverwrite = await confirm({
          message: 'gith.config.json already exists. Overwrite it?',
          initialValue: false,
        })

        if (!isPromptValue(shouldOverwrite)) {
          cancelCommand('Init cancelled.', 0)
        }

        if (!shouldOverwrite) {
          cancelCommand('Existing gith.config.json kept unchanged.', 0)
        }
      }

      intro('Initialize gith.config.json')

      const configContent = JSON.stringify(DEFAULT_GITH_CONFIG, null, 2)

      try {
        await writeFile(configPath, configContent, 'utf8')
        outro('Created gith.config.json in the current directory.')
      } catch (error) {
        cancelCommand(
          error instanceof Error
            ? error.message
            : 'Failed to create gith.config.json',
        )
      }
    })

  return command
}
