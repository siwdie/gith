export type GithSelectOption = {
  value: string
  label: string
  hint?: string
}

export type GithConfig = {
  defaultBranch: string
  branchTypes: Array<GithSelectOption>
  commitTypes: Array<GithSelectOption>
}
