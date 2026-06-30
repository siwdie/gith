import {
  confirm,
  intro,
  isCancel,
  outro,
  spinner
} from '@clack/prompts'
import { Command } from 'commander'
import { join } from 'path'

import { getConfigOrCancel } from '~/commands/_helper/get-config-or-cancel.js'
import { cancelCommand } from '~/utils/cancel-command.js'
import { rebuildChangelogFromTags } from '~/utils/changelog.js'
import { fileExists } from '~/utils/file.js'
import { getTags } from '~/utils/git.js'



export function createChangelogRebuildCommand (): Command {
  const command = new Command('rebuild')

  command
    .description('Rebuild CHANGELOG.md from all version tags')
    .action(async () => {
      const config = await getConfigOrCancel()

      const cwd = process.cwd()
      const configPath = join(cwd, config.changelog.file)

      intro('Rebuild changelog')

      const spinnerService = spinner()

      const configExists = await fileExists(configPath)

      if (configExists) {
        const shouldOverwrite = await confirm({
          message: `${config.changelog.file} already exists. Overwrite it?`,
          initialValue: false,
        })

        if (isCancel(shouldOverwrite)) {
          cancelCommand('Changelog rebuild cancelled.', 0)
        }

        if (!shouldOverwrite) {
          cancelCommand(`Existing ${config.changelog.file} kept unchanged.`, 0)
        }
      }

      spinnerService.start('Searching version tags...')
      const tagsResult = await getTags({
        pattern: config.changelog.tagPattern,
        sort: 'version:refname',
      })

      if (tagsResult.error !== null) {
        cancelCommand(tagsResult.error.message)
      }

      if (tagsResult.data.length < 2) {
        cancelCommand('At least two version tags are required to rebuild the changelog.')
      }

      spinnerService.message('Generating changelog entries...')
      const rebuildResult = await rebuildChangelogFromTags(config.changelog, tagsResult.data)

      if (rebuildResult.error !== null) {
        cancelCommand(rebuildResult.error.message)
      }

      spinnerService.clear()

      outro(`${rebuildResult.data} rebuilt successfully.`)
    })

  return command
}
