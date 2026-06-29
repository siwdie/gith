import {
  intro,
  isCancel,
  note,
  outro,
  spinner,
  text
} from '@clack/prompts'
import { Command } from 'commander'

import type { GithConfig } from '~/config/config.types.js'

import { getConfigOrCancel } from '~/commands/_helper/get-config-or-cancel.js'
import { buildCommitHeader } from '~/commands/_helper/prompt-commit.js'
import { hasReleaseHook, runReleaseAfterCommitHook, runReleaseBeforeCommitHook } from '~/commands/_helper/release-hooks.js'
import { cancelCommand } from '~/utils/cancel-command.js'
import {
  commitWithMessage,
  createTag,
  getCurrentBranchName,
  getStagedFilesScopeList,
  hasStagedChanges
} from '~/utils/git.js'



export function createBranchReleaseCommand (): Command {
  const command = new Command('release')

  command
    .description('Create a release commit and tag for the given version')
    .action(async () => {
      const config = await getConfigOrCancel()

      const branchName = await getCurrentBranchName()

      if (branchName.data !== config.defaultBranch)
        cancelCommand(`You must be in ${config.defaultBranch} branch to release a new version.`)

      intro('Create release')

      const scope = await getScope(config)

      const version = await text({
        message: 'Version to release',
        placeholder: '1.2.0',
        validate: (value) => {
          if (!value?.trim()) return 'Version cannot be empty'
          if (!/^\d+\.\d+\.\d+$/.test(value.trim())) return 'Version must follow semver format (e.g. 1.2.0)'
        },
      })

      if (isCancel(version)) cancelCommand('Operation cancelled.')

      const tag = scope ? `${scope}-v${version}` : `v${version}`

      const spinnerService = spinner()
      spinnerService.start('Preparing release...')


      if (!hasReleaseHook(config, 'beforeCommit')) {
        await ensureStagedChangesOrCancel()
      } else {
        spinnerService.message('Running release hook before commit...')
        await runReleaseBeforeCommitHook(config, { version, tag, scope })
        spinnerService.message('Preparing release...')
      }


      spinnerService.message('Checking staged changes...')

      await ensureStagedChangesOrCancel()


      spinnerService.message('Creating release commit...')

      const commitResult = await commitWithMessage(
        buildCommitHeader('release', scope, `Version ${version}`),
      )

      if (commitResult.error !== null) {
        spinnerService.clear()
        cancelCommand(commitResult.error.message)
      }

      spinnerService.message('Creating tag...')

      const tagResult = await createTag(tag, `Release ${tag}`)

      if (tagResult.error) cancelCommand(tagResult.error.message)


      if (hasReleaseHook(config, 'afterCommit')) {
        spinnerService.message('Running release hook before commit...')
        runReleaseAfterCommitHook(config, { version, tag, scope })
      }

      spinnerService.clear()

      outro(`Release ${tag} created.\nPush with: git push && git push origin ${tag}`)
    })

  return command
}

async function getScope (config: GithConfig): Promise<string> {
  if (!config.monorepo) return ''

  const scopeList = await getStagedFilesScopeList(config)

  if (scopeList.length > 1) {
    note(scopeList.join(', '), 'Staged files belong to multiple scopes:')
    cancelCommand('Please, release each scope separately.', 0)
  }

  return scopeList[0] === 'root' ? '' : scopeList[0]!
}

async function ensureStagedChangesOrCancel (): Promise<void> {
  const stagedResult = await hasStagedChanges()

  if (stagedResult.error) {
    cancelCommand(stagedResult.error.message)
  }

  if (!stagedResult.data) {
    cancelCommand('No staged changes found. Stage files first or configure release hooks to prepare them automatically.')
  }
}
