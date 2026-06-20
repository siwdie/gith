import type { GithConfig } from '~/config/config.types.js'



export const DEFAULT_GITH_CONFIG: GithConfig = {
  defaultBranch: 'main',
  branchTypes: [
    {
      value: 'feature',
      label: 'feature',
      hint: 'A new feature branch',
    },
    {
      value: 'bugfix',
      label: 'bugfix',
      hint: 'A bug fix branch',
    },
  ],
  commitTypes: [
    {
      value: 'feat',
      label: 'feat',
      hint: 'A new feature',
    },
    {
      value: 'fix',
      label: 'fix',
      hint: 'A bug fix',
    },
    {
      value: 'release',
      label: 'release',
      hint: 'Release branch',
    },
    {
      value: 'docs',
      label: 'docs',
      hint: 'Documentation only changes',
    },
    {
      value: 'refactor',
      label: 'refactor',
      hint: 'Code change without feature or fix',
    },
    {
      value: 'test',
      label: 'test',
      hint: 'Add or update tests',
    },
    {
      value: 'chore',
      label: 'chore',
      hint: 'Maintenance tasks',
    },
  ],
}
