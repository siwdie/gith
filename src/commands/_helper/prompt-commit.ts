import {
  confirm,
  isCancel,
  multiline,
  note,
  select,
  text
} from '@clack/prompts'

import type { GithConfig } from '~/config/config.types.js'

import { cancelCommand } from '~/utils/cancel-command.js'
import { getStagedFilesScopeList } from '~/utils/git.js'



export type PromptedCommitMessage = {
  header: string
  body?: string
}


export async function promptForCommitMessage (
  config: GithConfig,
  confirmationMessage = 'Use this commit message?',
): Promise<PromptedCommitMessage> {
  const scope = await getScope(config)

  const type = await select({
    message: 'Select the commit type',
    options: config.commitTypes,
  })

  if (isCancel(type)) {
    cancelCommand('Commit cancelled.', 0)
  }

  const description = await text({
    message: 'Short description',
    placeholder: 'add commit helper',
    validate: (value) => {
      const normalizedValue = value?.trim()

      if (!normalizedValue) {
        return 'Description is required.'
      }

      if (
        normalizedValue.length < config.commit.header.minLength
        || normalizedValue.length > config.commit.header.maxLength
      ) {
        return `Keep the description between ${config.commit.header.minLength} and ${config.commit.header.maxLength} characters.`
      }

      return undefined
    },
  })

  if (isCancel(description)) {
    cancelCommand('Commit cancelled.', 0)
  }

  const body = config.commit.body
    ? await multiline({
      message: 'Body',
      placeholder: 'Explain what changed and why',
      validate: (value) => {
        if (typeof config.commit.body === 'object') {
          const maxLength = config.commit.body?.maxLength

          const normalizedValue = value?.trim()

          if (config.commit.body?.required && !normalizedValue) {
            return 'Body is required.'
          }

          if (maxLength && (normalizedBody?.length ?? 0) > maxLength) {
            return `Keep body below ${config.commit.body?.maxLength} characters.`
          }
        }

        return undefined
      },
    })
    : undefined

  if (isCancel(body)) {
    cancelCommand('Commit cancelled.', 0)
  }

  const header = buildCommitHeader(type, scope, description)
  const normalizedBody = body?.trim()

  const shouldCommit = await confirm({
    message: normalizedBody
      ? `${confirmationMessage}\n\n${header}\n\n${normalizedBody}`
      : `${confirmationMessage}\n\n${header}`,
    initialValue: true,
  })

  if (isCancel(shouldCommit) || !shouldCommit) {
    cancelCommand('Commit cancelled.', 0)
  }

  return {
    header,
    body: normalizedBody,
  }
}

export function buildCommitHeader (
  type: string,
  scope: string,
  description: string,
): string {
  const normalizedScope = scope.trim()
  const normalizedDescription = description.trim()

  if (normalizedScope) {
    return `${type}(${normalizedScope}): ${normalizedDescription}`
  }

  return `${type}: ${normalizedDescription}`
}


async function getScope (config: GithConfig): Promise<string> {
  if (config.monorepo) {
    const scopeList = await getStagedFilesScopeList(config)

    if (scopeList.length > 1) {
      note(scopeList.join(','), 'Staged files belong to multiple scopes:')
      cancelCommand('Please, commit each scope separately.', 0)
    }

    return scopeList[0] ?? ''
  }

  const scope = config.scope

  if (!scope) return ''

  if (scope.type === 'text') {
    const scopeInput = await text({
      message: 'Scope',
      placeholder: scope.placeholder ?? 'branch',
      validate: value => {
        if (scope.required && !value) return 'Scope is required'
      },
    })

    if (isCancel(scopeInput)) cancelCommand('Commit cancelled.', 0)

    return scopeInput
  }

  const scopeInput = await select({
    message: 'Scope',
    options: scope.required
      ? scope.options
      : [{ value: '', label: 'none', hint: 'skip' }, ...scope.options],
  })

  if (isCancel(scopeInput)) cancelCommand('Commit cancelled.', 0)

  return scopeInput
}
