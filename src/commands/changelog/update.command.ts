import { intro, outro, spinner } from '@clack/prompts'
import { Command } from 'commander'
import { join } from 'path'

import { getConfigOrCancel } from '~/commands/_helper/get-config-or-cancel.js'
import { cancelCommand } from '~/utils/cancel-command.js'
import { changelogHasVersion, generateChangelogEntryFromTagRange, prependChangelogEntry } from '~/utils/changelog.js'
import { getTags } from '~/utils/git.js'



export function createChangelogUpdateCommand (): Command {
  const command = new Command('update')

  command
    .description('Update CHANGELOG.md with the latest release changes')
    .action(async () => {
      const config = await getConfigOrCancel()

      intro('Update changelog')

      const spinnerService = spinner()

      spinnerService.start('Searching latest tags...')
      const tagsResult = await getTags({
        pattern: config.changelog.tagPattern,
        sort: '-version:refname',
      })

      if (tagsResult.error !== null) {
        cancelCommand(tagsResult.error.message)
      }

      const [currentTag, previousTag] = tagsResult.data

      if (!currentTag || !previousTag) {
        cancelCommand('At least two version tags are required to update the changelog.')
      }

      const cwd = process.cwd()
      const configPath = join(cwd, config.changelog.file)

      const hasVersion = await changelogHasVersion(configPath, currentTag)

      if (hasVersion) {
        cancelCommand(`${currentTag} is already present in ${config.changelog.file}.`, 0)
      }

      spinnerService.message('Generating changelog entry...')
      const entryResult = await generateChangelogEntryFromTagRange(config.changelog, previousTag, currentTag)

      if (entryResult.error !== null) {
        cancelCommand(entryResult.error.message)
      }

      spinnerService.message('Updating changelog...')
      const writeResult = await prependChangelogEntry(config.changelog, entryResult.data)

      if (writeResult.error !== null) {
        cancelCommand(writeResult.error.message)
      }

      spinnerService.clear()

      outro(`${writeResult.data} updated from ${previousTag} to ${currentTag}.`)
    })

  return command
}
