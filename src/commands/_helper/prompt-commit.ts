import {
  cancel,
  confirm,
  multiline,
  select,
  text,
} from '@clack/prompts'

import { isPromptValue } from '~/guards/prompt.js'



type CommitTypeOption = {
  value: string
  label?: string
  hint?: string
}

type CommitConfig = {
  commitTypes: Array<CommitTypeOption>
}

export type PromptedCommitMessage = {
  header: string
  body?: string
}

export async function promptForCommitMessage (
  config: CommitConfig,
  confirmationMessage = 'Use this commit message?',
): Promise<PromptedCommitMessage> {
  const type = await select({
    message: 'Select the commit type',
    options: config.commitTypes,
  })

  if (!isPromptValue(type)) {
    cancelCommand('Commit cancelled.')
  }

  const scope = await text({
    message: 'Scope (optional)',
    placeholder: 'branch',
  })

  if (!isPromptValue(scope)) {
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

      if (normalizedValue.length > 72) {
        return 'Keep the description under 72 characters.'
      }

      return undefined
    },
  })

  if (!isPromptValue(description)) {
    cancelCommand('Commit cancelled.')
  }

  const body = await multiline({
    message: 'Body (optional)',
    placeholder: 'Explain what changed and why',
  })

  if (!isPromptValue(body)) {
    cancelCommand('Commit cancelled.')
  }

  const header = buildCommitHeader(type, scope, description)
  const normalizedBody = body.trim()

  const shouldCommit = await confirm({
    message: normalizedBody
      ? `${confirmationMessage}\n\n${header}\n\n${normalizedBody}`
      : `${confirmationMessage}\n\n${header}`,
    initialValue: true,
  })

  if (!isPromptValue(shouldCommit)) {
    cancelCommand('Commit cancelled.')
  }

  if (!shouldCommit) {
    cancelCommand('Commit cancelled.')
  }

  return {
    header,
    body: normalizedBody ?? undefined,
  }
}

function buildCommitHeader (
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

function cancelCommand (message: string): never {
  cancel(message)
  process.exit(0)
}
