import { cancel, confirm, intro, outro } from '@clack/prompts'
import { Command } from 'commander'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { DEFAULT_GITH_CONFIG } from '~/config/default.config.js'
import { isPromptValue } from '~/guards/prompt.js'
import { fileExists } from '~/utils/file.js'



type InitCommandOptions = {
  force?: boolean
}

function cancelCommand (): never {
  cancel('Init cancelled.')
  process.exit(0)
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
          cancelCommand()
        }

        if (!shouldOverwrite) {
          outro('Existing gith.config.json kept unchanged.')
          process.exit(0)
        }
      }

      intro('Initialize gith.config.json')

      const configContent = JSON.stringify(DEFAULT_GITH_CONFIG, null, 2)

      try {
        await writeFile(configPath, configContent, 'utf8')
        outro('Created gith.config.json in the current directory.')
      } catch (error) {
        cancel(
          error instanceof Error
            ? error.message
            : 'Failed to create gith.config.json',
        )
        process.exit(1)
      }
    })

  return command
}
