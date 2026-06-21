const BRANCH_NAME_PART_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidBranchNamePart (value: string): boolean {
  return BRANCH_NAME_PART_REGEX.test(value)
}
