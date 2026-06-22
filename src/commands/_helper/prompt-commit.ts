import {
  confirm,
  isCancel,
  multiline,
  select,
  text
} from '@clack/prompts'

import type { GithConfig } from '~/config/config.types.js'

import { cancelCommand } from '~/utils/cancel-command.js'



export type PromptedCommitMessage = {
  header: string
  body?: string
}

export async function promptForCommitMessage (
  config: GithConfig,
  confirmationMessage = 'Use this commit message?',
): Promise<PromptedCommitMessage> {
  const type = await select({
    message: 'Select the commit type',
    options: config.commitTypes,
  })

  if (isCancel(type)) {
    cancelCommand('Commit cancelled.')
  }

  const scope = await text({
    message: 'Scope (optional)',
    placeholder: 'branch',
  })

  if (isCancel(scope)) {
    cancelCommand('Commit cancelled.')
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
    cancelCommand('Commit cancelled.')
  }

  const body = config.commit.body.enabled ? await multiline({
    message: 'Body (optional)',
    placeholder: 'Explain what changed and why',
  }) : undefined

  if (isCancel(body)) {
    cancelCommand('Commit cancelled.')
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

