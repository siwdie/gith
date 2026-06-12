const BRANCH_NAME_PART_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/


export function normalizeBranchNamePart (value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isValidBranchNamePart (value: string): boolean {

  return BRANCH_NAME_PART_REGEX.test(value)
}
