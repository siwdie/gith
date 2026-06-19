import { cancel } from '@clack/prompts'



export function cancelCommand (message: string, exitCode: number = 1): never {
  cancel(message)
  process.exit(exitCode)
}
