import {
  intro,
  isCancel,
  outro,
  spinner,
  text
} from '@clack/prompts'
import { Command } from 'commander'


import { buildCommitHeader } from '~/commands/_helper/prompt-commit.js'
import { cancelCommand } from '~/utils/cancel-command.js'
import { commitWithMessage, createTag, hasStagedChanges } from '~utils/git.js'



export function createBranchReleaseCommand (): Command {
  const command = new Command('release')

  command
    .description('Create a release commit and tag for the given version')
    .action(async () => {
      intro('Create release')

      const stagedResult = await hasStagedChanges()

      if (stagedResult.error) {
        cancelCommand(stagedResult.error.message)
      }

      if (!stagedResult.data) {
        cancelCommand('No staged changes found. Stage files first or run the command with --all.')
      }

      const version = await text({
        message: 'Version to release',
        placeholder: '1.2.0',
        validate: (value) => {
          if (!value?.trim()) return 'Version cannot be empty'
          if (!/^\d+\.\d+\.\d+$/.test(value.trim())) return 'Version must follow semver format (e.g. 1.2.0)'
        },
      })

      if (isCancel(version)) {
        cancelCommand('Operation cancelled.')
      }

      const spinnerService = spinner()

      spinnerService.start('Creating release commit...')

      const tag = `v${version}`

      const commitResult = await commitWithMessage(
        buildCommitHeader('release', '', tag),
      )

      if (commitResult.error !== null) {
        cancelCommand(commitResult.error.message)
      }

      spinnerService.message('Creating tag...')

      const tagResult = await createTag(tag, `Release ${tag}`)


      spinnerService.clear()

      if (tagResult.error) {
        cancelCommand(tagResult.error.message)
      }

      outro(`Release ${tag} created.\n Push with: git push origin ${tag}`)
    })

  return command
}
