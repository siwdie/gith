import { isCancel } from '@clack/prompts'



export function isPromptValue<T> (value: T | symbol): value is T {
  return !isCancel(value)
}
