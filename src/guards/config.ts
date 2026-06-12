import type { GithSelectOption, GithConfig } from '~/config/config.types.js'



function isPlainObject (
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
}

function isNonEmptyString (value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function isSelectOption (
  value: unknown,
): value is GithSelectOption {
  if (!isPlainObject(value)) {
    return false
  }

  if (!isNonEmptyString(value.value)) {
    return false
  }

  if (!isNonEmptyString(value.label)) {
    return false
  }

  if (
    value.hint !== undefined
    && !isNonEmptyString(value.hint)
  ) {
    return false
  }

  return true
}

function isSelectOptionArray (
  value: unknown,
): value is Array<GithSelectOption> {
  return Array.isArray(value) && value.every(isSelectOption)
}

export function isPartialGithConfig (
  value: unknown,
): value is Partial<GithConfig> {
  if (!isPlainObject(value)) {
    return false
  }

  if (
    value.defaultBranch !== undefined
    && !isNonEmptyString(value.defaultBranch)
  ) {
    return false
  }

  if (
    value.branchTypes !== undefined
    && !isSelectOptionArray(value.branchTypes)
  ) {
    return false
  }

  if (
    value.commitTypes !== undefined
    && !isSelectOptionArray(value.commitTypes)
  ) {
    return false
  }

  return true
}
