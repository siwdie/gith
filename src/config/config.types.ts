import z from 'zod'

import { zBooleanOrFalse, zNumberPositive, zStringOptional, zStringRequired } from '~/utils/zod.js'



export const monorepoSchema = z.object({ type: z.enum(['pnpm', 'yarn', 'cargo', 'maven', 'gradle']) })


export const selectOptionSchema = z.object({
  value: zStringRequired,
  label: zStringOptional,
  hint: zStringOptional,
})


export const commitHeaderSchema = z.object({
  minLength: zNumberPositive,
  maxLength: zNumberPositive,
})

export const commitBodySchema = z.union([
  z.literal(true),
  z.literal(false),
  z.object({
    maxLength: zNumberPositive,
    required: zBooleanOrFalse,
  }).partial(),
])


export const commitScopeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    placeholder: zStringOptional,
    required: zBooleanOrFalse,
  }),
  z.object({
    type: z.literal('select'),
    options: z.array(selectOptionSchema),
    required: zBooleanOrFalse,
  }),
])


export const releaseHooksSchema = z.object({
  beforeCommit: zStringOptional,
  afterCommit: zStringOptional,
})

export const releaseSchema = z.object({
  hooks: releaseHooksSchema.optional(),
})


export const changelogSectionSchema = z.object({
  title: zStringRequired,
  types: z.array(zStringRequired).min(1),
})

export const changelogAuthorsSchema = z.union([
  z.literal(true),
  z.literal(false),
  z.object({
    label: zStringOptional,
    links: z.record(zStringRequired, z.url()),
  })
])

export const changelogSchema = z.object({
  file: zStringRequired,
  tagPattern: zStringRequired,
  sections: z.array(changelogSectionSchema),
  breakingTitle: zStringRequired,
  emptyMessage: zStringRequired,
  authors: changelogAuthorsSchema.optional()
})


export const githConfigSchema = z.object({
  monorepo: monorepoSchema.optional(),
  defaultBranch: zStringRequired,
  branchTypes: z.array(selectOptionSchema),
  commitTypes: z.array(selectOptionSchema),
  scope: commitScopeSchema.optional(),
  commit: z.object({
    header: commitHeaderSchema,
    body: commitBodySchema.optional(),
  }),
  release: releaseSchema.optional(),
  changelog: changelogSchema,
})

export const githConfigPartialSchema = githConfigSchema
  .omit({
    commit: true,
    changelog: true,
  })
  .partial()
  .extend({
    commit: githConfigSchema.shape.commit
      .omit({
        header: true,
      })
      .partial()
      .extend({
        header: commitHeaderSchema.partial().optional(),
      })
      .optional(),
    changelog: changelogSchema
      .omit({
        sections: true,
      })
      .partial()
      .extend({
        sections: z.array(changelogSectionSchema).optional(),
      })
      .optional(),
  })

export type Monorepo = z.infer<typeof monorepoSchema>
export type MonorepoType = z.infer<typeof monorepoSchema>['type']

export type SelectOption = z.infer<typeof selectOptionSchema>

export type CommitHeader = z.infer<typeof commitHeaderSchema>
export type CommitBody = z.infer<typeof commitBodySchema>
export type CommitScope = z.infer<typeof commitScopeSchema>

export type Release = z.infer<typeof releaseSchema>

export type Changelog = z.infer<typeof changelogSchema>
export type ChangelogSection = z.infer<typeof changelogSectionSchema>


export type GithConfig = z.infer<typeof githConfigSchema>
export type GithConfigPartial = z.infer<typeof githConfigPartialSchema>
