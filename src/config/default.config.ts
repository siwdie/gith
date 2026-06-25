import type { GithConfig } from '~/config/config.types.js'



export const DEFAULT_GITH_CONFIG: GithConfig = {
  defaultBranch: 'main',
  commit: {
    header: {
      minLength: 10,
      maxLength: 72,
    },
  },
  branchTypes: [
    {
      value: 'feature',
      hint: 'A new feature branch',
    },
    {
      value: 'bugfix',
      hint: 'A bug fix branch',
    },
  ],
  commitTypes: [
    {
      value: 'feat',
      hint: 'A new feature',
    },
    {
      value: 'fix',
      hint: 'A bug fix',
    },
    {
      value: 'release',
      hint: 'Release branch',
    },
    {
      value: 'docs',
      hint: 'Documentation only changes',
    },
    {
      value: 'refactor',
      hint: 'Code change without feature or fix',
    },
    {
      value: 'test',
      hint: 'Add or update tests',
    },
    {
      value: 'chore',
      hint: 'Maintenance tasks',
    },
  ],
}
