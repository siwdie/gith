import {
  intro,
  isCancel,
  note,
  outro,
  spinner,
  text
} from '@clack/prompts'
import { Command } from 'commander'

import type { SpinnerResult } from '@clack/prompts'
import type { GithConfig } from '~/config/config.types.js'

import { getConfigOrCancel } from '~/commands/_helper/get-config-or-cancel.js'
import { buildCommitHeader } from '~/commands/_helper/prompt-commit.js'
import { runReleaseBeforeCommitHook } from '~/commands/_helper/release-hooks.js'
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

      await executeHooks(config, version, tag, scope, spinnerService)


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

      spinnerService.clear()

      if (tagResult.error) {
        cancelCommand(tagResult.error.message)
      }

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

function hasReleaseHooks (config: GithConfig): boolean {
  return Object.values(config.release?.hooks ?? {}).some((hook) => Boolean(hook?.trim()))
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

async function executeHooks (
  config: GithConfig,
  version: string,
  tag: string,
  scope: string,
  spinnerService: SpinnerResult
): Promise<void> {
  if (!hasReleaseHooks(config)) {
    await ensureStagedChangesOrCancel()
    return
  }

  const hooks = config.release?.hooks

  if (hooks?.beforeCommit?.trim()) {
    spinnerService.stop('Running release hooks...')

    const hookResult = await runReleaseBeforeCommitHook({
      config,
      version,
      tag,
      scope,
    })

    if (hookResult.error) {
      cancelCommand(hookResult.error.message)
    }

    spinnerService.start('Preparing release...')
  }
}
